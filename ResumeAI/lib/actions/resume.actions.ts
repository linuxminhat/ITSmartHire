"use server";

import { useUser } from "@clerk/nextjs";
import Education from "../models/education.model";
import Experience from "../models/experience.model";
import Resume from "../models/resume.model";
import Skill from "../models/skill.model";
import { connectToDB } from "../mongoose";
import { revalidatePath } from "next/cache";
import Project from "../models/project.model";
import Certificate from "../models/certificate.model";
import Language from "../models/language.model";
import Award from "../models/award.model";

export async function createResume({
  resumeId,
  userId,
  title,
}: {
  resumeId: string;
  userId: string;
  title: string;
}) {
  try {
    await connectToDB();

    const newResume = await Resume.create({
      resumeId,
      userId,
      title,
    });

    return { success: true, data: JSON.stringify(newResume) };
  } catch (error: any) {
    console.error(`Failed to create resume: ${error.message}`);
    return { success: false, error: error.message };
  }
}

export async function fetchResume(resumeId: string) {
  try {
    await connectToDB();

    const resume = await Resume.findOne({ resumeId: resumeId })
      .populate({
        path: "experience",
        model: Experience,
      })
      .populate({
        path: "education",
        model: Education,
      })
      .populate({
        path: "skills",
        model: Skill,
      });

    return JSON.stringify(resume);
  } catch (error: any) {
    throw new Error(`Failed to fetch resume: ${error.message}`);
  }
}

export async function fetchUserResumes(userId: string) {
  if (userId === "") {
    return [];
  }

  try {
    await connectToDB();

    const resumes = await Resume.find({ userId: userId });

    return JSON.stringify(resumes);
  } catch (error: any) {
    throw new Error(`Failed to fetch user resumes: ${error.message}`);
  }
}

export async function checkResumeOwnership(userId: string, resumeId: string) {
  if (userId === "") {
    return false;
  }

  try {
    await connectToDB();

    const resume = await Resume.findOne({ resumeId: resumeId, userId: userId });

    return resume ? true : false;
  } catch (error: any) {
    throw new Error(`Failed to check resume ownership: ${error.message}`);
  }
}

export async function updateResume({
  resumeId,
  updates,
}: {
  resumeId: string;
  updates: Partial<{
    firstName: string;
    lastName: string;
    jobTitle: string;
    address: string;
    phone: string;
    email: string;
    summary: string;
    themeColor: string;
  }>;
}) {
  try {
    await connectToDB();

    const resume = await Resume.findOne({ resumeId: resumeId });

    if (!resume) {
      return { success: false, error: "Resume not found" };
    }

    Object.keys(updates).forEach((key) => {
      const updateValue = updates[key as keyof typeof updates];

      if (updateValue !== undefined) {
        resume[key as keyof typeof updates] = updateValue;
      }
    });

    resume.updatedAt = new Date();

    const updatedResume = await resume.save();

    return { success: true, data: JSON.stringify(updatedResume) };
  } catch (error: any) {
    console.error(`Failed to update resume: ${error.message}`);
    return { success: false, error: error.message };
  }
}

export async function addExperienceToResume(
  resumeId: string,
  experienceDataArray: any
) {
  try {
    const resume = await Resume.findOne({ resumeId: resumeId });

    if (!resume) {
      throw new Error("Resume not found");
    }

    const savedExperiences = await Promise.all(
      experienceDataArray.map(async (experienceData: any) => {
        if (experienceData._id) {
          const existingExperience = await Experience.findById(
            experienceData._id
          );
          if (existingExperience) {
            return await Experience.findByIdAndUpdate(
              experienceData._id,
              experienceData,
              { new: true }
            );
          }
        }
        const newExperience = new Experience(experienceData);
        return await newExperience.save();
      })
    );

    const experienceIds = savedExperiences.map((experience) => experience._id);
    resume.experience = experienceIds;

    const updatedResume = await resume.save();

    return { success: true, data: JSON.stringify(updatedResume) };
  } catch (error: any) {
    console.error("Error adding or updating experience to resume: ", error);
    return { success: false, error: error?.message };
  }
}

export async function addEducationToResume(
  resumeId: string,
  educationDataArray: any
) {
  try {
    const resume = await Resume.findOne({ resumeId: resumeId });

    if (!resume) {
      throw new Error("Resume not found");
    }

    const savedEducation = await Promise.all(
      educationDataArray.map(async (educationData: any) => {
        if (educationData._id) {
          const existingEducation = await Education.findById(educationData._id);
          if (existingEducation) {
            return await Education.findByIdAndUpdate(
              educationData._id,
              educationData,
              { new: true }
            );
          }
        }
        const newEducation = new Education(educationData);
        return await newEducation.save();
      })
    );

    const educationIds = savedEducation.map((education) => education._id);
    resume.education = educationIds;

    const updatedResume = await resume.save();

    return { success: true, data: JSON.stringify(updatedResume) };
  } catch (error: any) {
    console.error("Error adding or updating education to resume: ", error);
    return { success: false, error: error?.message };
  }
}

export async function addSkillToResume(
  resumeId: string,
  skillDataArray: any
) {
  try {
    const resume = await Resume.findOne({ resumeId: resumeId });

    if (!resume) {
      throw new Error("Resume not found");
    }

    const savedSkills = await Promise.all(
      skillDataArray.map(async (skillData: any) => {
        if (skillData._id) {
          const existingSkill = await Skill.findById(skillData._id);
          if (existingSkill) {
            return await Skill.findByIdAndUpdate(skillData._id, skillData, {
              new: true,
            });
          }
        }
        const newSkill = new Skill(skillData);
        return await newSkill.save();
      })
    );

    const skillIds = savedSkills.map((skill) => skill._id);
    resume.skills = skillIds;

    const updatedResume = await resume.save();

    return { success: true, data: JSON.stringify(updatedResume) };
  } catch (error: any) {
    console.error("Error adding or updating skill to resume: ", error);
    return { success: false, error: error?.message };
  }
}
export async function addProjectToResume(
  resumeId: string,
  projectDataArray: any
) {
  try {
    const resume = await Resume.findOne({ resumeId: resumeId });
    if (!resume) throw new Error("Resume not found");

    const savedProjects = await Promise.all(
      projectDataArray.map(async (projectData: any) => {
        if (projectData._id) {
          const existingProject = await Project.findById(projectData._id);
          if (existingProject) {
            return await Project.findByIdAndUpdate(
              projectData._id,
              projectData,
              { new: true }
            );
          }
        }
        const newProject = new Project(projectData);
        return await newProject.save();
      })
    );

    const projectIds = savedProjects.map((project) => project._id);
    resume.projects = projectIds;

    const updatedResume = await resume.save();
    return { success: true, data: JSON.stringify(updatedResume) };
  } catch (error: any) {
    console.error("Error adding or updating project to resume: ", error);
    return { success: false, error: error?.message };
  }
}
export async function addCertificateToResume(
  resumeId: string,
  certificateDataArray: any
) {
  try {
    const resume = await Resume.findOne({ resumeId: resumeId });
    if (!resume) throw new Error("Resume not found");

    const savedCertificates = await Promise.all(
      certificateDataArray.map(async (certificateData: any) => {
        if (certificateData._id) {
          const existingCertificate = await Certificate.findById(certificateData._id);
          if (existingCertificate) {
            return await Certificate.findByIdAndUpdate(
              certificateData._id,
              certificateData,
              { new: true }
            );
          }
        }
        const newCertificate = new Certificate(certificateData);
        return await newCertificate.save();
      })
    );

    const certificateIds = savedCertificates.map((c) => c._id);
    resume.certificates = certificateIds;

    const updatedResume = await resume.save();
    return { success: true, data: JSON.stringify(updatedResume) };
  } catch (error: any) {
    console.error("Error adding or updating certificate to resume: ", error);
    return { success: false, error: error?.message };
  }
}
export async function addLanguageToResume(
  resumeId: string,
  languageDataArray: any
) {
  try {
    const resume = await Resume.findOne({ resumeId: resumeId });
    if (!resume) throw new Error("Resume not found");

    const savedLanguages = await Promise.all(
      languageDataArray.map(async (languageData: any) => {
        if (languageData._id) {
          const existingLanguage = await Language.findById(languageData._id);
          if (existingLanguage) {
            return await Language.findByIdAndUpdate(
              languageData._id,
              languageData,
              { new: true }
            );
          }
        }
        const newLanguage = new Language(languageData);
        return await newLanguage.save();
      })
    );

    const languageIds = savedLanguages.map((l) => l._id);
    resume.languages = languageIds;

    const updatedResume = await resume.save();
    return { success: true, data: JSON.stringify(updatedResume) };
  } catch (error: any) {
    console.error("Error adding or updating language to resume: ", error);
    return { success: false, error: error?.message };
  }
}
export async function addAwardToResume(
  resumeId: string,
  awardDataArray: any
) {
  try {
    const resume = await Resume.findOne({ resumeId: resumeId });
    if (!resume) throw new Error("Resume not found");

    const savedAwards = await Promise.all(
      awardDataArray.map(async (awardData: any) => {
        if (awardData._id) {
          const existingAward = await Award.findById(awardData._id);
          if (existingAward) {
            return await Award.findByIdAndUpdate(
              awardData._id,
              awardData,
              { new: true }
            );
          }
        }
        const newAward = new Award(awardData);
        return await newAward.save();
      })
    );

    const awardIds = savedAwards.map((a) => a._id);
    resume.awards = awardIds;

    const updatedResume = await resume.save();
    return { success: true, data: JSON.stringify(updatedResume) };
  } catch (error: any) {
    console.error("Error adding or updating award to resume: ", error);
    return { success: false, error: error?.message };
  }
}

export async function deleteResume(resumeId: string, path: string) {
  try {
    await connectToDB();

    await Resume.findOneAndDelete({ resumeId: resumeId });

    revalidatePath(path);

    return { success: true };
  } catch (error: any) {
    console.error(`Failed to delete resume: ${error.message}`);
    return { success: false, error: error.message };
  }
}
