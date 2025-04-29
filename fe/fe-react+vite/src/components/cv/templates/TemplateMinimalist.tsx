import React from 'react';
import { Document, Page, Text, View, StyleSheet, Link, Font } from '@react-pdf/renderer';
import { IUser, IEducation, IExperience, IProject, ICertificate, IAward } from '@/types/backend';
import { format, parseISO } from 'date-fns';

// --- Font Registration (Consider a clean sans-serif like Inter or Source Sans Pro) ---
// Font.register({
//   family: 'Inter',
//   fonts: [
//     { src: '/fonts/Inter-Regular.ttf' },
//     { src: '/fonts/Inter-Medium.ttf', fontWeight: 500 }, // Medium for headings
//     { src: '/fonts/Inter-Bold.ttf', fontWeight: 'bold' },
//   ]
// });

// --- Date Formatting Helper ---
const formatDate = (dateInput: string | Date | undefined | null): string => {
    if (!dateInput) return 'Present';
    try {
        let date: Date;
        if (typeof dateInput === 'string') date = parseISO(dateInput);
        else if (dateInput instanceof Date) date = dateInput;
        else return 'Invalid Date';
        if (isNaN(date.getTime())) return typeof dateInput === 'string' ? dateInput : 'Invalid Date';
        return format(date, 'yyyy'); // Minimalist: Just the year or range
    } catch (error) {
        console.error("Error formatting date:", dateInput, error);
        return typeof dateInput === 'string' ? dateInput : 'Date Error';
    }
};

const formatYearRange = (startDateInput: string | Date | undefined | null, endDateInput: string | Date | undefined | null): string => {
    const startYear = formatDate(startDateInput);
    const endYear = formatDate(endDateInput);
    if (startYear === 'Invalid Date') return 'Invalid Date';
    if (endYear === 'Present') return `${startYear} - Present`;
    if (startYear === endYear) return startYear;
    return `${startYear} - ${endYear}`;
};

// --- Define styles for a Minimalist template ---
const styles = StyleSheet.create({
    page: {
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica', // Fallback, use registered font like 'Inter'
        fontSize: 10,
        lineHeight: 1.5, // Slightly more line height for readability
        color: '#2D3748', // Dark Gray
        padding: '40pt 40pt', // Generous padding
    },
    // --- Header Section ---
    header: {
        textAlign: 'center',
        marginBottom: 30,
    },
    name: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1A202C', // Near Black
        marginBottom: 6,
        // fontFamily: 'Inter', fontWeight: 700,
    },
    jobTitle: {
        fontSize: 13,
        color: '#4A5568', // Medium-Dark Gray
        marginBottom: 10,
        // fontFamily: 'Inter', fontWeight: 500,
    },
    contactInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginTop: 5,
    },
    contactItem: {
        fontSize: 9,
        color: '#718096', // Medium Gray
        marginHorizontal: 8, // Space between items
        marginBottom: 4,
    },
    contactLink: {
        fontSize: 9,
        color: '#4A5568', // Link color same as text or slightly darker
        textDecoration: 'none',
        marginHorizontal: 8,
        marginBottom: 4,
    },
    // --- Section Styling ---
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2D3748', // Dark Gray
        marginBottom: 12,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0', // Light Gray border
        textTransform: 'uppercase',
        letterSpacing: 1, // Add slight letter spacing
        // fontFamily: 'Inter', fontWeight: 500,
    },
    // --- Item Styling (Experience, Education, etc.) ---
    itemContainer: {
        marginBottom: 15,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    itemTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1A202C',
        // fontFamily: 'Inter', fontWeight: 700,
        maxWidth: '80%',
    },
    itemSubtitle: {
        fontSize: 10,
        color: '#4A5568',
        marginBottom: 5,
        // fontStyle: 'italic', // Less emphasis
    },
    itemDate: {
        fontSize: 9,
        color: '#718096',
        textAlign: 'right',
        minWidth: '60pt', // Space for year range
    },
    itemDescription: {
        fontSize: 10,
        color: '#4A5568',
        marginTop: 3,
    },
    bulletPoint: {
        flexDirection: 'row',
        marginLeft: 12, // Simple indent
        marginBottom: 4,
    },
    bullet: {
        width: 5,
        marginRight: 5,
        marginTop: 3, // Align bullet
    },
    // --- Skills ---
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    skillItem: {
        fontSize: 9.5,
        color: '#4A5568',
        backgroundColor: '#F7FAFC', // Very light gray background
        padding: '3pt 6pt',
        marginRight: 6,
        marginBottom: 6,
        borderRadius: 3,
        borderWidth: 1,
        borderColor: '#E2E8F0', // Light border
    },
    // --- Projects ---
    projectLink: {
        fontSize: 9,
        color: '#4A5568',
        textDecoration: 'underline',
        marginLeft: 12,
        marginTop: 3,
    },
    projectTech: {
        fontSize: 9,
        color: '#718096',
        marginLeft: 12,
        marginTop: 3,
    },
    // --- Certificates & Awards ---
    certAwardContainer: {
        marginBottom: 10,
    },
    certAwardTitle: {
        fontSize: 10.5,
        fontWeight: 'bold',
        color: '#1A202C',
    },
    certAwardSubtitle: {
        fontSize: 9.5,
        color: '#4A5568',
        marginBottom: 2,
    },
    certAwardDate: {
        fontSize: 9,
        color: '#718096',
    },
    certAwardLink: {
        fontSize: 9,
        color: '#4A5568',
        textDecoration: 'underline',
    },
    // --- Footer ---
    footer: {
        position: 'absolute',
        bottom: 25, // Consistent padding
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 8,
        color: '#A0AEC0', // Lighter gray
    }
});

// --- Reusable Component for Sections ---
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>
);

// --- Reusable Component for Experience/Project/Education Items ---
const ListItem: React.FC<{
    title: string;
    subtitle?: string;
    dateRange?: string;
    description?: string;
    linkUrl?: string;
    technologies?: string[];
}> = ({ title, subtitle, dateRange, description, linkUrl, technologies }) => {
    const descriptionPoints = description?.split('\n').map(s => s.trim()).filter(s => s !== '') || [];
    return (
        <View style={styles.itemContainer}>
            <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{title}</Text>
                {dateRange && <Text style={styles.itemDate}>{dateRange}</Text>}
            </View>
            {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
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
            {descriptionPoints.length === 0 && description && (
                 <Text style={styles.itemDescription}>{description}</Text> // Display non-bulleted description
            )}
        </View>
    );
};

// --- Main Template Component ---
interface TemplateProps {
    profileData: IUser | null;
}

const TemplateMinimalist: React.FC<TemplateProps> = ({ profileData }) => {
    if (!profileData) {
        return (
            <Document>
                <Page size="A4" style={styles.page}>
                    <View style={{ padding: 30 }}><Text>Loading profile data...</Text></View>
                </Page>
            </Document>
        );
    }

    const { education = [], experience = [], skills = [], projects = [], certificates = [], awards = [] } = profileData;

    return (
        <Document title={`${profileData.name} CV - Minimalist`}>
            <Page size="A4" style={styles.page}>
                {/* --- Header --- */}
                <View style={styles.header}>
                    <Text style={styles.name}>{profileData.name || 'User Name'}</Text>
                    <Text style={styles.jobTitle}>{profileData.jobTitle || 'Professional'}</Text>
                    <View style={styles.contactInfoContainer}>
                        {profileData.email && <Text style={styles.contactItem}>{profileData.email}</Text>}
                        {profileData.phone && <Text style={styles.contactItem}>{profileData.phone}</Text>}
                        {profileData.address && <Text style={styles.contactItem}>{profileData.address}</Text>}
                        {profileData.linkedIn && 
                            <Link style={styles.contactLink} src={profileData.linkedIn}>
                                LinkedIn
                            </Link>
                        }
                         {profileData.portfolio && 
                            <Link style={styles.contactLink} src={profileData.portfolio}>
                                Portfolio
                            </Link>
                        }
                    </View>
                </View>

                {/* --- Summary --- */}
                 {profileData.aboutMe && (
                    <Section title="Summary">
                        <Text style={styles.itemDescription}>{profileData.aboutMe}</Text>
                    </Section>
                )}

                {/* --- Experience --- */}
                {experience.length > 0 && (
                    <Section title="Experience">
                        {experience.map((exp, index) => (
                            <ListItem
                                key={exp._id || index}
                                title={exp.jobTitle || 'N/A'}
                                subtitle={exp.companyName || 'N/A'}
                                dateRange={formatYearRange(exp.startDate, exp.endDate)}
                                description={exp.description}
                            />
                        ))}
                    </Section>
                )}

                {/* --- Projects --- */}
                {projects.length > 0 && (
                    <Section title="Projects">
                        {projects.map((proj, index) => (
                            <ListItem
                                key={proj._id || index}
                                title={proj.name || 'N/A'}
                                dateRange={formatYearRange(proj.startDate, proj.endDate)}
                                description={proj.description}
                                linkUrl={proj.url}
                                technologies={proj.technologiesUsed}
                            />
                        ))}
                    </Section>
                )}

                {/* --- Education --- */}
                 {education.length > 0 && (
                    <Section title="Education">
                        {education.map((edu, index) => (
                            <ListItem
                                key={edu._id || index}
                                title={edu.degree || 'N/A'}
                                subtitle={`${edu.school || 'N/A'}${edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ''}`}
                                dateRange={formatYearRange(edu.startDate, edu.endDate)}
                                description={edu.description}
                            />
                        ))}
                    </Section>
                )}\n
                {/* --- Skills --- */}
                {skills.length > 0 && (
                    <Section title="Skills">
                        <View style={styles.skillsContainer}>
                            {skills.map((skill, index) => (
                                <Text key={index} style={styles.skillItem}>{skill}</Text>
                            ))}
                        </View>
                    </Section>
                )}

                 {/* --- Certificates & Awards --- */}
                 {certificates.length > 0 && (
                    <Section title="Certificates">
                        {certificates.map((cert, index) => (
                            <View key={cert._id || index} style={styles.certAwardContainer}>
                                <Text style={styles.certAwardTitle}>{cert.name || 'N/A'}</Text>
                                {cert.issuingOrganization && <Text style={styles.certAwardSubtitle}>{cert.issuingOrganization}</Text>}
                                {cert.issueDate && <Text style={styles.certAwardDate}>Issued: {formatDate(cert.issueDate)}</Text>}
                                {cert.credentialUrl && 
                                    <Link style={styles.certAwardLink} src={cert.credentialUrl}>
                                        View Credential
                                    </Link>
                                }
                            </View>
                        ))}
                    </Section>
                 )}
                {awards.length > 0 && (
                    <Section title="Awards">
                        {awards.map((award, index) => (
                             <View key={award._id || index} style={styles.certAwardContainer}>
                                <Text style={styles.certAwardTitle}>{award.name || 'N/A'}</Text>
                                {award.issuingOrganization && <Text style={styles.certAwardSubtitle}>{award.issuingOrganization}</Text>}
                                {award.issueDate && <Text style={styles.certAwardDate}>Date: {formatDate(award.issueDate)}</Text>}
                                {award.description && <Text style={styles.itemDescription}>{award.description}</Text>}
                            </View>
                        ))}
                    </Section>
                )}

                {/* --- Footer --- */}
                <Text style={styles.footer} fixed>
                    Generated by IT SMART HIRE - {format(new Date(), 'MM/dd/yyyy')}
                </Text>
            </Page>
        </Document>
    );
};

export default TemplateMinimalist; 