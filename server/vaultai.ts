import { GoogleGenAI } from '@google/genai';
import { DocumentItem, Checklist } from './db';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function askVaultAI(
  userQuery: string,
  history: Message[],
  studentName: string,
  userDocuments: DocumentItem[],
  userChecklists: Checklist[]
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  // Build structured summary of user's active documents
  const docsContext = userDocuments.map(doc => {
    return {
      name: doc.name,
      category: doc.category,
      tags: doc.tags,
      description: doc.description,
      issueDate: doc.issueDate || 'None',
      expiryDate: doc.expiryDate || 'No Expiry',
      isImportant: doc.isImportant,
      sizeKB: Math.round(doc.fileSize / 1024),
    };
  });

  const checklistsContext = userChecklists.map(cl => ({
    title: cl.title,
    type: cl.type,
    totalItems: cl.items.length,
    completedItems: cl.items.filter(i => i.completed).length,
    items: cl.items.map(i => `${i.label} (${i.completed ? 'COMPLETED' : 'PENDING'})`),
  }));

  const systemInstruction = `You are VaultAI, the intelligent and private academic document assistant for UniVault — the Smart Student Digital Locker.

Current Authenticated Student: ${studentName}

STUDENT'S STORED DOCUMENTS:
${JSON.stringify(docsContext, null, 2)}

STUDENT'S APPLICATION CHECKLISTS:
${JSON.stringify(checklistsContext, null, 2)}

CRITICAL SECURITY & BEHAVIOR RULES:
1. You have access ONLY to this specific authenticated student's documents. NEVER reference or speculate about any other student's data.
2. Provide concise, helpful, and accurate answers regarding their academic credentials, certificates, transcripts, identity papers, financial records, and application readiness.
3. If asked about expiring documents, calculate against the current date (assume year 2026) and highlight urgent or upcoming deadlines.
4. If asked what documents are missing for scholarship, internship, or college applications, compare the student's stored documents with typical application requirements and their active checklists.
5. Maintain a professional, supportive, and privacy-first tone. Keep responses formatted with clean Markdown bullet points.`;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      // Add recent history up to 6 turns
      for (const msg of history.slice(-6)) {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }

      contents.push({
        role: 'user',
        parts: [{ text: userQuery }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.4,
        },
      });

      const outputText = response.text;
      if (outputText && outputText.trim().length > 0) {
        return outputText.trim();
      }
    } catch (err) {
      console.warn('Gemini API call failed or timed out, using local intelligent student assistant fallback:', err);
    }
  }

  // Graceful, intelligent rule-based local assistant fallback
  return generateLocalVaultAIResponse(userQuery, userDocuments, userChecklists);
}

function generateLocalVaultAIResponse(
  query: string,
  docs: DocumentItem[],
  checklists: Checklist[]
): string {
  const lower = query.toLowerCase();

  // 1. Expiring documents
  if (lower.includes('expire') || lower.includes('expiry') || lower.includes('attention') || lower.includes('renew')) {
    const expiring = docs.filter(d => {
      if (!d.expiryDate) return false;
      const days = Math.round((new Date(d.expiryDate).getTime() - Date.now()) / (1000 * 3600 * 24));
      return days <= 90;
    });

    if (expiring.length === 0) {
      return `Good news! None of your ${docs.length} stored documents are expiring within the next 90 days. All credentials and identification papers are currently in good standing.`;
    }

    const items = expiring
      .map(d => {
        const days = Math.round((new Date(d.expiryDate!).getTime() - Date.now()) / (1000 * 3600 * 24));
        const status = days <= 0 ? '⚠️ EXPIRED' : days <= 30 ? `🚨 Urgent: ${days} days remaining` : `⏳ ${days} days remaining`;
        return `- **${d.name}** (${d.category}): ${status} (Expires: ${d.expiryDate})`;
      })
      .join('\n');

    return `I found **${expiring.length} document${expiring.length > 1 ? 's' : ''}** requiring your attention:\n\n${items}\n\n*Tip: You can upload an updated copy directly in the Locker to maintain compliance.*`;
  }

  // 2. Academic / Certificates / Transcripts
  if (lower.includes('academic') || lower.includes('transcript') || lower.includes('certificate') || lower.includes('grade')) {
    const matching = docs.filter(
      d => d.category === 'Academic' || d.category === 'Achievements' || d.tags.some(t => t.toLowerCase().includes('transcript') || t.toLowerCase().includes('certificate'))
    );

    if (matching.length === 0) {
      return `You currently have no academic transcripts or certificates uploaded in your locker. Click **Upload Document** to add your marks cards, degree certificates, or achievement proofs.`;
    }

    const list = matching.map(d => `- **${d.name}** — Category: *${d.category}* · ${Math.round(d.fileSize / 1024)} KB · Tags: [${d.tags.join(', ')}]`).join('\n');
    return `Here are your stored **Academic & Achievement Documents** (${matching.length} total):\n\n${list}\n\nAll documents are encrypted with verified digital checksums.`;
  }

  // 3. Scholarship application check
  if (lower.includes('scholarship') || lower.includes('financial aid') || lower.includes('grant')) {
    const hasIncome = docs.some(d => d.category === 'Financial' || d.name.toLowerCase().includes('income'));
    const hasTranscript = docs.some(d => d.name.toLowerCase().includes('transcript') || d.name.toLowerCase().includes('grade') || d.name.toLowerCase().includes('marks'));
    const hasId = docs.some(d => d.category === 'Identity' || d.name.toLowerCase().includes('id'));
    const hasBonafide = docs.some(d => d.name.toLowerCase().includes('bonafide'));

    let checklistText = `For typical scholarship applications, here is your readiness evaluation:\n\n`;
    checklistText += `- ${hasId ? '✅' : '❌'} **Student ID Card**: ${hasId ? 'Present in locker' : 'Missing'}\n`;
    checklistText += `- ${hasTranscript ? '✅' : '❌'} **Previous Semester Transcripts**: ${hasTranscript ? 'Present in locker' : 'Missing'}\n`;
    checklistText += `- ${hasIncome ? '✅' : '❌'} **Income / Financial Statement**: ${hasIncome ? 'Present in locker' : 'Missing'}\n`;
    checklistText += `- ${hasBonafide ? '✅' : '❌'} **Bonafide Certificate**: ${hasBonafide ? 'Present in locker' : 'Missing (request from Registrar)'}\n\n`;

    const readiness = (Number(hasId) + Number(hasTranscript) + Number(hasIncome) + Number(hasBonafide)) * 25;
    checklistText += `**Current Scholarship Readiness: ${readiness}%**\nYou can generate an official application package or checklist from the *Application Checklists* tab.`;
    return checklistText;
  }

  // 4. Internship / Career
  if (lower.includes('internship') || lower.includes('career') || lower.includes('resume') || lower.includes('offer letter') || lower.includes('placement')) {
    const careerDocs = docs.filter(d => d.category === 'Career' || d.category === 'Achievements');
    if (careerDocs.length === 0) {
      return `You haven't added career-specific documents yet. We recommend uploading your Resume, Internship Offer Letters, and Recommendation Letters into the **Career** category.`;
    }
    const list = careerDocs.map(d => `- **${d.name}** (${d.category})`).join('\n');
    return `I found **${careerDocs.length} career & achievement documents** in your vault:\n\n${list}\n\nYou can generate secure temporary 24-hour links to share these with recruiters.`;
  }

  // 5. Total count / What documents do I have
  if (lower.includes('what document') || lower.includes('how many') || lower.includes('list') || lower.includes('overview')) {
    const categories: Record<string, number> = {};
    docs.forEach(d => {
      categories[d.category] = (categories[d.category] || 0) + 1;
    });

    const catSummary = Object.entries(categories)
      .map(([cat, count]) => `- **${cat}**: ${count} document${count > 1 ? 's' : ''}`)
      .join('\n');

    return `You currently have **${docs.length} secure documents** stored in UniVault:\n\n${catSummary}\n\nAll documents are encrypted, isolated to your student profile, and accessible for secure temporary sharing.`;
  }

  // Default helpful response
  return `I have analyzed your **${docs.length} stored documents** and **${checklists.length} active checklists**. 

You can ask me to:
- Find specific documents (e.g., *"Show my academic certificates"*)
- Check expiring records (e.g., *"Which documents expire soon?"*)
- Review requirements for applications (e.g., *"What documents do I have for scholarship applications?"*)
- Check career credentials (e.g., *"Find my internship offer letter"*)

What would you like me to inspect for you?`;
}
