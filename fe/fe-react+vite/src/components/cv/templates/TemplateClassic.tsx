import React from 'react';
import { Document, Page, Text, View, StyleSheet, Link, Font } from '@react-pdf/renderer';
import { IUser, IEducation, IExperience, IProject, ICertificate, IAward } from '@/types/backend';
import { format, parseISO } from 'date-fns'; // For date formatting

// --- Font Registration (Example: Roboto) ---
// Make sure you have the font files (.ttf) available in your project, e.g., in public/fonts
// Font.register({
//   family: 'Roboto',
//   fonts: [
//     { src: '/fonts/Roboto-Regular.ttf' }, // Adjust path as needed
//     { src: '/fonts/Roboto-Bold.ttf', fontWeight: 'bold' },
//     { src: '/fonts/Roboto-Italic.ttf', fontStyle: 'italic' },
//     { src: '/fonts/Roboto-BoldItalic.ttf', fontWeight: 'bold', fontStyle: 'italic' },
//   ],
// });

// --- Helper Function for Date Formatting ---
const formatDate = (dateInput: string | Date | undefined | null): string => {
    if (!dateInput) return 'Present'; // Or handle as needed

    try {
        let date: Date;
        if (typeof dateInput === 'string') {
            // Attempt to parse ISO string (common format from backend/JSON)
            date = parseISO(dateInput);
        } else if (dateInput instanceof Date) {
            // If it's already a Date object
            date = dateInput;
        } else {
            // Handle unexpected types if necessary
            return 'Invalid Date';
        }

        // Check if the parsed/provided date is valid
        if (isNaN(date.getTime())) {
            // Handle invalid date strings that parseISO might produce (e.g., "Invalid Date")
            console.warn("Invalid date encountered:", dateInput);
            // Attempt to return original string if it was a string, otherwise indicate invalid
            return typeof dateInput === 'string' ? dateInput : 'Invalid Date'; 
        }

        return format(date, 'MM/yyyy'); // Format as MM/YYYY
    } catch (error) {
        console.error("Error formatting date:", dateInput, error);
        // Return original input or a generic error message
        return typeof dateInput === 'string' ? dateInput : 'Date Error'; 
    }
};

// --- Define styles based on the "Elegant" template ---
const styles = StyleSheet.create({
    page: {
        flexDirection: 'row', // Two columns layout
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica', // Consider using a specific font like Roboto if available
        fontSize: 9.5, // Slightly reduce base font size for more content fit
        lineHeight: 1.3, // Adjust line height for readability
        color: '#444444', // Darker gray for body text
    },
    // --- Left Column (Wider) ---
    leftColumn: {
        width: '70%',
        padding: '25pt 15pt 25pt 25pt', // T R B L - Reduced padding slightly
    },
    // --- Right Column (Narrower) ---
    rightColumn: {
        width: '30%',
        padding: '25pt 25pt 25pt 15pt', // T R B L - Reduced padding slightly
        backgroundColor: '#F8F8F8', // Very light gray background
        color: '#555555', // Slightly lighter text color for sidebar
    },
    // --- General Section Styling ---
    section: {
        marginBottom: 12, // Reduced margin between sections
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#2c5282', // Slightly darker blue
        marginBottom: 6, // Reduced margin below title
        textTransform: 'uppercase',
        borderBottomWidth: 1.5, // Slightly thicker border
        borderBottomColor: '#2c5282',
        paddingBottom: 2,
    },
    // --- Header / Personal Info (Right Column) ---
    name: {
        fontSize: 22, // Slightly smaller name
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#1A202C', // Very dark gray / near black
    },
    jobTitle: {
        fontSize: 11,
        color: '#718096', // Medium gray
        marginBottom: 12,
    },
    contactInfoContainer: {
        marginBottom: 8,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4, // Increased spacing slightly
        fontSize: 9,
        color: '#4A5568', // Darker gray for contact info
    },
    // --- About Me (Left Column) ---
    aboutMeText: {
        fontSize: 9.5,
        textAlign: 'justify',
        color: '#4A5568', // Consistent dark gray
    },
    // --- Experience & Education Items ---
    itemContainer: {
        marginBottom: 8, // Reduced spacing between items
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start', // Align items to the top
        marginBottom: 2,
    },
    itemTitle: {
        fontSize: 10.5, // Slightly larger titles
        fontWeight: 'bold',
        color: '#2D3748', // Darker item title
        maxWidth: '80%', // Prevent long titles from pushing dates too far
    },
    itemSubtitle: {
        fontSize: 9.5,
        fontStyle: 'italic',
        color: '#718096', // Medium gray
        marginBottom: 2,
    },
    itemDate: {
        fontSize: 8.5,
        color: '#A0AEC0', // Lighter gray for dates
        textAlign: 'right', // Align dates to the right
        minWidth: '50pt', // Ensure enough space for dates
    },
    itemDescription: {
        fontSize: 9.5,
        color: '#4A5568', // Consistent body text color
    },
    bulletPoint: {
        flexDirection: 'row',
        marginLeft: 10, // Indent bullets
        marginBottom: 3, // Spacing between bullet points
    },
    bullet: {
        width: 6,
        marginRight: 4,
        fontSize: 10, // Make bullet slightly larger/visible
        // marginTop: 1, // Fine-tune vertical alignment if needed
    },
    // --- Skills (Right Column) ---
    skillsContainer: {
        // Could add flexWrap: 'wrap' if needed for many skills
    },
    skillItem: {
        marginBottom: 3,
        fontSize: 9.5, // Consistent font size
        color: '#4A5568',
    },
    // --- Projects (Left Column) ---
    projectLink: {
        fontSize: 8.5,
        color: '#3182CE', // Brighter blue for links
        textDecoration: 'none', // Remove underline by default, maybe add on hover if possible
        marginLeft: 10,
        marginBottom: 3,
    },
    projectTech: {
        fontSize: 8.5,
        fontStyle: 'italic',
        color: '#718096',
        marginLeft: 10,
        marginBottom: 3,
    },
    // --- Certificates & Awards (Right Column) ---
    certAwardDate: {
        fontSize: 8.5,
        color: '#A0AEC0', // Lighter gray
        marginLeft: 0, // No extra indent needed here if title/subtitle are clear
        marginBottom: 3,
    },
    // --- Links ---
    link: {
        color: '#3182CE',
        textDecoration: 'none',
    },
    // --- Footer ---
    footer: {
        position: 'absolute',
        bottom: 15, // Move up slightly
        left: 25,
        right: 25,
        textAlign: 'center',
        fontSize: 7.5, // Smaller footer text
        color: '#A0AEC0', // Light gray
    }
});

// --- Reusable Component for Sections ---
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>
);

// --- Reusable Component for List Items (Edu/Exp/Proj) ---
const ListItem: React.FC<{
    title: string;
    subtitle?: string;
    dateRange?: string;
    description?: string | string[]; // Can be a single string or array of bullets
    linkUrl?: string;
    technologies?: string[];
    issueDate?: string;
}> = ({ title, subtitle, dateRange, description, linkUrl, technologies, issueDate }) => {
    // Split description string into an array of bullet points if it's a string
    const descriptionPoints = typeof description === 'string'
        ? description.split('\n').map(s => s.trim()).filter(s => s !== '')
        : description || [];

    return (
        <View style={styles.itemContainer}>
            <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{title}</Text>
                {dateRange && <Text style={styles.itemDate}>{dateRange}</Text>}
            </View>
            {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
            {issueDate && <Text style={styles.certAwardDate}>Issued: {issueDate}</Text>}
            {linkUrl && <Link style={styles.projectLink} src={linkUrl}>{linkUrl}</Link>}
            {technologies && technologies.length > 0 && (
                <Text style={styles.projectTech}>Technologies: {technologies.join(', ')}</Text>
            )}
            {descriptionPoints.length > 0 && descriptionPoints.map((point, index) => (
                <View key={index} style={styles.bulletPoint}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.itemDescription}>{point}</Text>
                </View>
            ))}
        </View>
    );
};

// --- Main Template Component ---
interface TemplateProps {
    profileData: IUser | null;
}

const TemplateClassic: React.FC<TemplateProps> = ({ profileData }) => {
    if (!profileData) {
        // Return a simple placeholder document if data is null
        return (
            <Document>
                <Page size="A4" style={styles.page}>
                    <View style={{ padding: 30 }}>
                        <Text>Loading profile data...</Text>
                    </View>
                </Page>
            </Document>
        );
    }

    // Safely access potentially undefined arrays
    const education = profileData.education ?? [];
    const experience = profileData.experience ?? [];
    const skills = profileData.skills ?? [];
    const projects = profileData.projects ?? [];
    const certificates = profileData.certificates ?? [];
    const awards = profileData.awards ?? [];

    return (
        <Document title={`${profileData.name} CV`}>
            <Page size="A4" style={styles.page}>

                {/* === Left Column === */}
                <View style={styles.leftColumn}>
                    {/* About Me */}
                    {profileData.aboutMe && (
                        <Section title="About Me">
                            <Text style={styles.aboutMeText}>{profileData.aboutMe}</Text>
                        </Section>
                    )}

                    {/* Work Experience */}
                    {experience.length > 0 && (
                        <Section title="Work Experience">
                            {experience.map((exp, index) => (
                                <ListItem
                                    key={exp._id || index}
                                    title={exp.jobTitle || 'N/A'}
                                    subtitle={exp.companyName || 'N/A'}
                                    dateRange={`${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}`}
                                    // Pass the raw description string; ListItem will handle splitting
                                    description={exp.description}
                                />
                            ))}
                        </Section>
                    )}

                    {/* Projects */}
                    {projects.length > 0 && (
                        <Section title="Projects">
                            {projects.map((proj, index) => (
                                <ListItem
                                    key={proj._id || index}
                                    title={proj.name || 'N/A'}
                                    dateRange={`${formatDate(proj.startDate)} - ${formatDate(proj.endDate)}`}
                                    // Pass the raw description string
                                    description={proj.description}
                                    linkUrl={proj.url}
                                    technologies={proj.technologiesUsed}
                                />
                            ))}
                        </Section>
                    )}
                </View>

                {/* === Right Column === */}
                <View style={styles.rightColumn}>
                    {/* Personal Details */}
                    <View style={styles.section}>
                         <Text style={styles.name}>{profileData.name || 'User Name'}</Text>
                         {/* TODO: Add Job Title from profile if available */}
                         <Text style={styles.jobTitle}>Software Developer</Text>

                         <View style={styles.contactInfoContainer}>
                             {profileData.phone && <Text style={styles.contactItem}>{profileData.phone}</Text>}
                             {profileData.email && <Text style={styles.contactItem}>{profileData.email}</Text>}
                             {/* TODO: Add Birthday/Age if desired */}
                             {/* {profileData.age && <Text style={styles.contactItem}>Age: {profileData.age}</Text>} */}
                             {profileData.address && <Text style={styles.contactItem}>{profileData.address}</Text>}
                             {/* TODO: Add LinkedIn/Portfolio Link if available */}
                             {/* <Link style={styles.contactItem} src={"https://linkedin.com/..."}>LinkedIn Profile</Link> */}
                         </View>
                    </View>

                    {/* Education */}
                    {education.length > 0 && (
                        <Section title="Education">
                            {education.map((edu, index) => (
                                <ListItem
                                    key={edu._id || index}
                                    title={edu.degree || 'N/A'}
                                    subtitle={edu.school || 'N/A'}
                                    dateRange={`${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}`}
                                     // Pass the raw description string
                                    description={edu.description}
                                />
                            ))}
                        </Section>
                    )}

                    {/* Skills */}
                    {skills.length > 0 && (
                        <Section title="Skills">
                            {skills.map((skill, index) => (
                                <Text key={index} style={styles.skillItem}>• {skill}</Text>
                            ))}
                        </Section>
                    )}

                    {/* Certificates */}
                    {certificates.length > 0 && (
                        <Section title="Certificates">
                            {certificates.map((cert, index) => (
                                <ListItem
                                    key={cert._id || index}
                                    title={cert.name || 'N/A'}
                                    subtitle={cert.issuingOrganization}
                                    linkUrl={cert.credentialUrl}
                                    issueDate={formatDate(cert.issueDate)}
                                />
                            ))}
                        </Section>
                    )}

                     {/* Awards */}
                     {awards.length > 0 && (
                        <Section title="Awards">
                            {awards.map((award, index) => (
                                <ListItem
                                    key={award._id || index}
                                    title={award.name || 'N/A'}
                                    subtitle={award.issuingOrganization}
                                    issueDate={formatDate(award.issueDate)}
                                    description={award.description}
                                />
                            ))}
                        </Section>
                    )}
                </View>

                 {/* Footer */}
                 <Text style={styles.footer} fixed>
                     Generated by IT SMART HIRE - {format(new Date(), 'dd/MM/yyyy')}
                 </Text>
            </Page>
        </Document>
    );
};

export default TemplateClassic; 