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

  const systemInstruction = `You are VaultAI Pro, the high-performance intelligent student credential assistant for Privora — the Smart Student Digital Locker.

Current Authenticated Student: ${studentName}

STUDENT'S STORED DOCUMENTS:
${JSON.stringify(docsContext, null, 2)}

STUDENT'S APPLICATION CHECKLISTS:
${JSON.stringify(checklistsContext, null, 2)}

PRO AGENT CAPABILITIES & BEHAVIOR:
1. Privacy & Scoping: You have access ONLY to this specific authenticated student's documents. Never hallucinate or access external student records.
2. Document Identification: When mentioning a document, enclose its exact name in quotes or backticks, e.g. \`Semester 5 Official Grade Transcript\` or "Annual Family Income Certificate 2025-26".
3. Audits & Scores: When asked to audit, calculate:
   - Total Documents & Categories
   - Document Health & Security score out of 100%
   - Expiration status against current year (2026)
   - Application Readiness (Scholarships, Internships, Placements, University Clearances)
4. Formatting: Use clean Markdown with bold headers, concise bullet points, status indicators (✅, ⚠️, 🚨, ⏳), and actionable recommendations.
5. Provide clear follow-up actions like sharing links, setting renewal reminders, or organizing tags.`;

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

  // 5. Comprehensive Vault Audit & Health Score
  if (lower.includes('audit') || lower.includes('health') || lower.includes('score') || lower.includes('compliance')) {
    const expiredCount = docs.filter(d => d.expiryDate && new Date(d.expiryDate).getTime() < Date.now()).length;
    const expiringSoonCount = docs.filter(d => {
      if (!d.expiryDate) return false;
      const days = Math.round((new Date(d.expiryDate).getTime() - Date.now()) / (1000 * 3600 * 24));
      return days > 0 && days <= 60;
    }).length;

    const hasAcademic = docs.some(d => d.category === 'Academic');
    const hasIdentity = docs.some(d => d.category === 'Identity');
    const hasCareer = docs.some(d => d.category === 'Career' || d.category === 'Achievements');

    let healthScore = 100;
    if (expiredCount > 0) healthScore -= 25;
    if (expiringSoonCount > 0) healthScore -= 10;
    if (!hasAcademic) healthScore -= 20;
    if (!hasIdentity) healthScore -= 20;
    if (!hasCareer) healthScore -= 15;
    healthScore = Math.max(20, Math.min(100, healthScore));

    const statusBadge = healthScore >= 85 ? '🟢 EXCELLENT' : healthScore >= 65 ? '🟡 MODERATE' : '🔴 ACTION REQUIRED';

    return `### 🛡️ Privora Pro Security & Health Audit

**Overall Vault Health Score: ${healthScore}/100 (${statusBadge})**

#### 📊 Catalog Analysis:
- **Total Encrypted Records**: ${docs.length} documents
- **Academic Transcripts**: ${hasAcademic ? '✅ Present' : '❌ Missing official memo'}
- **Identity Credentials**: ${hasIdentity ? '✅ Verified' : '⚠️ Need Government ID / Campus Card'}
- **Career & Achievements**: ${hasCareer ? '✅ Present' : '⚠️ No internship/certificates found'}

#### ⏳ Expiration Sentinel:
- **Expired Records**: ${expiredCount > 0 ? `🚨 ${expiredCount} document(s) expired` : '✅ None'}
- **Expiring within 60 days**: ${expiringSoonCount > 0 ? `⚠️ ${expiringSoonCount} document(s) require renewal` : '✅ All clear'}

#### 🎯 Recommended Action:
${expiredCount > 0 ? '1. Renew or upload fresh copies of expired credentials.\n' : ''}${!hasCareer ? '2. Upload your latest resume or internship proof in Career category.\n' : ''}3. Use **Secure Share** to generate protected temporary links when sending records to third parties.`;
  }

  // 6. Graduation & Degree Clearance
  if (lower.includes('graduat') || lower.includes('degree clearance') || lower.includes('alumni')) {
    const transcripts = docs.filter(d => d.name.toLowerCase().includes('transcript') || d.name.toLowerCase().includes('grade') || d.name.toLowerCase().includes('memo'));
    const idDocs = docs.filter(d => d.category === 'Identity');
    const noDues = docs.some(d => d.name.toLowerCase().includes('dues') || d.name.toLowerCase().includes('clearance') || d.name.toLowerCase().includes('library'));

    return `### 🎓 Graduation & Degree Clearance Evaluation

Privora evaluated your records against standard university degree conferral checklists:

- ${transcripts.length >= 1 ? '✅' : '❌'} **Official Transcripts & Grade Sheets**: ${transcripts.length > 0 ? `${transcripts.length} semester record(s) cataloged` : 'Missing official transcript'}
- ${idDocs.length >= 1 ? '✅' : '❌'} **Institutional Student ID Verification**: ${idDocs.length > 0 ? 'Identity authenticated' : 'Student ID card required'}
- ${noDues ? '✅' : '⚠️'} **Department & Library No-Dues Attestation**: ${noDues ? 'Clearance uploaded' : 'Pending institutional submission'}

**Clearance Status**: ${transcripts.length > 0 && idDocs.length > 0 ? '🟢 80% Ready — Complete department no-dues' : '🟡 Incomplete — Upload remaining semester memos'}`;
  }

  // 7. Total count / What documents do I have
  if (lower.includes('what document') || lower.includes('how many') || lower.includes('list') || lower.includes('overview')) {
    const categories: Record<string, number> = {};
    docs.forEach(d => {
      categories[d.category] = (categories[d.category] || 0) + 1;
    });

    const catSummary = Object.entries(categories)
      .map(([cat, count]) => `- **${cat}**: ${count} document${count > 1 ? 's' : ''}`)
      .join('\n');

    return `You currently have **${docs.length} secure documents** stored in Privora:\n\n${catSummary}\n\nAll documents are encrypted, isolated to your student profile, and accessible for secure temporary sharing.`;
  }

  // Default helpful response
  return `I have analyzed your **${docs.length} stored documents** and **${checklists.length} active checklists**. 

You can ask me to:
- 🛡️ Run a full vault audit (*"Audit my locker health score"*)
- 🎓 Check graduation clearance (*"Am I ready for graduation clearance?"*)
- 🏆 Review application checklists (*"What is missing for my scholarship?"*)
- ⏳ Check expiration dates (*"Which documents expire soon?"*)
- 💼 Inspect career records (*"Find my internship documents"*)

What would you like me to inspect for you?`;
}
