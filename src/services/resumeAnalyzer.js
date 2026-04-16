// Resume Analysis Service demo module for resume upload and ATS scoring
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = pdfWorker;

class ResumeAnalyzer {
  constructor() {
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
    this.isInitialized = true;
  }

  async extractTextFromFile(file) {
    const fileType = file.name.split(".").pop().toLowerCase();
    if (fileType === "txt") {
      return await file.text();
    }

    if (fileType === "pdf") {
      return await this.extractTextFromPdf(file);
    }

    throw new Error(
      `Unsupported file type: ${fileType}. Please upload a .txt or .pdf file.`,
    );
  }

  async extractTextFromPdf(file) {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = "";

    for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
      const page = await pdf.getPage(pageIndex);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(" ");
      fullText += `${pageText}\n`;
    }

    return fullText;
  }

  async analyzeResume(text) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    await new Promise((resolve) => setTimeout(resolve, 1200));
    return this.generateDemoAnalysis(text);
  }

  countBulletPoints(lines) {
    return lines.filter((line) => /^([*\-•]|\d+\.)\s+/.test(line)).length;
  }

  extractKeywords(text, keywordList) {
    const lower = text.toLowerCase();
    return keywordList.filter((keyword) =>
      lower.includes(keyword.toLowerCase()),
    );
  }

  generateDemoAnalysis(text) {
    const cleaned = text.replace(/\r/g, "").trim();
    const words = cleaned.split(/\s+/).filter(Boolean);
    const lines = cleaned
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
    const lower = cleaned.toLowerCase();

    const wordCount = words.length;
    const sentenceCount = cleaned.split(/[.!?]+\s*/).filter(Boolean).length;
    const bulletCount = this.countBulletPoints(lines);
    const averageWordsPerSentence = sentenceCount
      ? Math.round(wordCount / sentenceCount)
      : 0;

    const hasEmail = /[\w.+-]+@[\w-]+\.[\w.-]+/.test(text);
    const hasPhone =
      /\+?\d{1,3}?[-.\s]?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/.test(text);
    const hasLinkedIn = /linkedin\.com\/[\w-]+/.test(lower);
    const hasGitHub = /github\.com\/[\w-]+/.test(lower);
    const hasSummary =
      /^(summary|professional summary|profile|career objective|objective)/im.test(
        cleaned,
      );
    const hasExperience =
      /^(experience|work experience|professional experience|employment history)/im.test(
        cleaned,
      );
    const hasSkills = /^(skills|technical skills|core skills|expertise)/im.test(
      cleaned,
    );
    const hasEducation =
      /^(education|academic background|qualifications)/im.test(cleaned);
    const hasProjects = /^(projects|selected projects|portfolio)/im.test(
      cleaned,
    );
    const hasCertifications = /^(certifications|licenses|certificates)/im.test(
      cleaned,
    );
    const hasAchievements = /^(achievements|awards|honors)/im.test(cleaned);

    const skillKeywords = [
      "javascript",
      "react",
      "node.js",
      "node",
      "python",
      "sql",
      "typescript",
      "aws",
      "docker",
      "kubernetes",
      "html",
      "css",
      "java",
      "c++",
      "git",
      "excel",
      "communication",
      "leadership",
      "management",
      "analytics",
      "design",
    ];

    const foundSkillKeywords = this.extractKeywords(cleaned, skillKeywords);
    const skillCoverage = Math.min(foundSkillKeywords.length * 5, 25);

    const contactScore =
      (hasEmail ? 10 : 0) +
      (hasPhone ? 10 : 0) +
      (hasLinkedIn ? 5 : 0) +
      (hasGitHub ? 5 : 0);

    const sectionScore =
      (hasSummary ? 5 : 0) +
      (hasExperience ? 10 : 0) +
      (hasSkills ? 10 : 0) +
      (hasEducation ? 10 : 0) +
      (hasProjects || hasCertifications || hasAchievements ? 5 : 0);

    const lengthScore =
      wordCount >= 250 && wordCount <= 800
        ? 15
        : wordCount >= 180 && wordCount <= 1000
          ? 10
          : 5;

    const bulletScore = bulletCount >= 5 ? 10 : bulletCount >= 3 ? 5 : 0;
    const readabilityScore =
      averageWordsPerSentence >= 10 && averageWordsPerSentence <= 25 ? 10 : 5;

    let score = 0;
    score += contactScore;
    score += sectionScore;
    score += lengthScore;
    score += skillCoverage;
    score += bulletScore;
    score += readabilityScore;
    score = Math.min(100, score);

    const strengths = [];
    const weaknesses = [];

    if (hasEmail && hasPhone)
      strengths.push("Contact section is complete and easy to find.");
    if (foundSkillKeywords.length >= 4)
      strengths.push(
        "Resume includes several relevant technical and soft-skill keywords.",
      );
    if (hasExperience) strengths.push("Work experience section is present.");
    if (hasSkills) strengths.push("Skills section is clearly defined.");
    if (bulletCount >= 5)
      strengths.push("Uses bullets for accomplishment-oriented readability.");

    if (!hasEmail)
      weaknesses.push("Add a professional email address in the header.");
    if (!hasPhone)
      weaknesses.push(
        "Add a phone number so recruiters can contact you directly.",
      );
    if (!hasExperience)
      weaknesses.push("Include a dedicated work experience section.");
    if (!hasSkills)
      weaknesses.push("Add a skills section with relevant keywords.");
    if (!hasEducation)
      weaknesses.push(
        "Include education or certifications to support your background.",
      );
    if (wordCount < 250)
      weaknesses.push(
        "Increase resume detail to clearly show your qualifications.",
      );
    if (bulletCount < 3)
      weaknesses.push("Use more bullet points to improve scanability.");
    if (averageWordsPerSentence > 30)
      weaknesses.push("Shorten long sentences to improve ATS readability.");

    const recommendedKeywords = [
      ...foundSkillKeywords.slice(0, 8),
      "problem solving",
      "teamwork",
      "communication",
    ];

    return {
      overallScore: score,
      wordCount,
      sectionSummary: {
        summary: hasSummary,
        experience: hasExperience,
        skills: hasSkills,
        education: hasEducation,
        projects: hasProjects,
        certifications: hasCertifications,
      },
      strengths,
      weaknesses,
      atsOptimization: [
        "Keep your resume under 1,000 words and above 250 words for ATS stability.",
        "Use standard section headings such as Experience, Skills, and Education.",
        "Include a strong set of job-specific keywords from the target role.",
        "Use bullet points and action verbs for each accomplishment.",
      ],
      keywordAnalysis: foundSkillKeywords.length
        ? [...new Set(foundSkillKeywords)].slice(0, 12)
        : [
            "Consider adding role-specific keywords such as Python, React, AWS, or SQL.",
          ],
      rawAnalysis:
        "This demo analyzer is tuned for browser-based assessment and uses resume structure, keywords, and formatting signals.",
      recommendedKeywords,
      formatting: {
        bullets: bulletCount,
        averageWordsPerSentence,
      },
    };
  }
}

export default new ResumeAnalyzer();
