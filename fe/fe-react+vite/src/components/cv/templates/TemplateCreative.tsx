import React from 'react';
import { Document, Page, Text, View, StyleSheet, Link, Font, Image } from '@react-pdf/renderer';
import { IUser, IEducation, IExperience, IProject, ICertificate, IAward } from '@/types/backend';
import { format, parseISO } from 'date-fns';

// --- Font Registration (Consider a creative font like Montserrat or Raleway) ---
// Font.register({
//   family: 'Raleway',
//   fonts: [
//     { src: '/fonts/Raleway-Regular.ttf' },
//     { src: '/fonts/Raleway-Bold.ttf', fontWeight: 'bold' },
//     { src: '/fonts/Raleway-Italic.ttf', fontStyle: 'italic' },
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
        return format(date, 'MMM yyyy'); // Use abbreviated month format
    } catch (error) {
        console.error("Error formatting date:", dateInput, error);
        return typeof dateInput === 'string' ? dateInput : 'Date Error';
    }
};

// --- Define styles for a Creative template ---
const RgbToHex = (r: number, g: number, b: number) => '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
}).join('');

// Define color palette (Example: Shades of Purple and Teal)
const colors = {
    primary: RgbToHex(88, 86, 214), // Purple
    secondary: RgbToHex(90, 200, 250), // Light Blue
    accent: RgbToHex(50, 173, 230), // Teal
    textDark: RgbToHex(50, 50, 50), // Dark Gray
    textLight: RgbToHex(240, 240, 240), // Very Light Gray / White
    background: RgbToHex(255, 255, 255),
    sidebarBackground: RgbToHex(45, 45, 60), // Dark background for sidebar
};

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: colors.background,
        fontFamily: 'Helvetica', // Fallback, use registered font like 'Raleway'
        fontSize: 10,
        color: colors.textDark,
        padding: 30,
    },
    // --- Header Section ---
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
        paddingBottom: 15,
        borderBottomWidth: 2,
        borderBottomColor: colors.primary,
    },
    name: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 4,
        // fontFamily: 'Raleway', // Use registered font
    },
    jobTitle: {
        fontSize: 14,
        color: colors.accent,
        marginBottom: 10,
    },
    contactInfoContainer: {
        textAlign: 'right',
    },
    contactItem: {
        fontSize: 9,
        marginBottom: 3,
        color: colors.textDark,
    },
    contactLink: {
        fontSize: 9,
        color: colors.primary,
        textDecoration: 'none',
    },
    // --- Main Content Area (Single Column Approach) ---
    mainContent: {
        // Using single column for creative layout variation
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 10,
        // fontFamily: 'Raleway', // Use registered font
        borderBottomWidth: 1,
        borderBottomColor: colors.accent,
        paddingBottom: 4,
        textTransform: 'uppercase',
    },
    // --- Experience & Education Items ---
    itemContainer: {
        marginBottom: 15,
        paddingLeft: 10, // Indent items slightly
        borderLeftWidth: 2,
        borderLeftColor: colors.secondary,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 3,
    },
    itemTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.textDark,
        marginBottom: 2,
        maxWidth: '85%',
    },
    itemSubtitle: {
        fontSize: 10,
        fontStyle: 'italic',
        color: '#666',
        marginBottom: 4,
    },
    itemDate: {
        fontSize: 9,
        color: colors.accent,
        textAlign: 'right',
        fontWeight: 'bold',
    },
    itemDescription: {
        fontSize: 10,
        color: colors.textDark,
        lineHeight: 1.4,
    },
    bulletPoint: {
        flexDirection: 'row',
        marginBottom: 4,
        marginLeft: 5, // Indent bullets slightly more
    },
    bullet: {
        width: 5,
        marginRight: 5,
        color: colors.accent,
        fontSize: 10,
    },
    // --- Skills ---
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 5,
    },
    skillItem: {
        backgroundColor: colors.secondary,
        color: colors.textDark,
        fontSize: 9,
        padding: '3pt 6pt',
        marginRight: 5,
        marginBottom: 5,
        borderRadius: 4,
    },
    // --- Projects ---
    projectLink: {
        fontSize: 9,
        color: colors.primary,
        textDecoration: 'underline',
        marginLeft: 5, // Align with bullets
        marginTop: 3,
    },
    projectTech: {
        fontSize: 9,
        fontStyle: 'italic',
        color: '#666',
        marginLeft: 5,
        marginTop: 3,
    },
    // --- Certificates & Awards ---
    certAwardContainer: {
         marginBottom: 12,
         paddingLeft: 10, // Indent items slightly
         borderLeftWidth: 2,
         borderLeftColor: colors.secondary,
    },
    certAwardTitle: {
         fontSize: 11,
         fontWeight: 'bold',
         color: colors.textDark,
    },
    certAwardSubtitle: {
         fontSize: 9.5,
         color: '#666',
         marginBottom: 2,
    },
    certAwardDate: {
         fontSize: 9,
         color: colors.accent,
         fontWeight: 'bold',
    },
     certAwardLink: {
        fontSize: 9,
        color: colors.primary,
        textDecoration: 'underline',
    },
    // --- Footer ---
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 30,
        right: 30,
        textAlign: 'center',
        fontSize: 8,
        color: '#AAAAAA',
    }
});

// --- Reusable Component for Sections ---
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>
);

// --- Reusable Component for List Items (Edu/Exp/Proj/Award/Cert) ---
const ListItem: React.FC<{
    title: string;
    subtitle?: string;
    dateRange?: string;
    description?: string;
    linkUrl?: string;
    technologies?: string[];
    issueDate?: string;
    isCertOrAward?: boolean;
}> = ({ title, subtitle, dateRange, description, linkUrl, technologies, issueDate, isCertOrAward }) => {
    const descriptionPoints = description?.split('\n').map(s => s.trim()).filter(s => s !== '') || [];
    const containerStyle = isCertOrAward ? styles.certAwardContainer : styles.itemContainer;
    const titleStyle = isCertOrAward ? styles.certAwardTitle : styles.itemTitle;
    const subtitleStyle = isCertOrAward ? styles.certAwardSubtitle : styles.itemSubtitle;
    const dateStyle = isCertOrAward ? styles.certAwardDate : styles.itemDate;

    return (
        <View style={containerStyle}>
            <View style={styles.itemHeader}>
                <Text style={titleStyle}>{title}</Text>
                {(dateRange || issueDate) && <Text style={dateStyle}>{dateRange || issueDate}</Text>}
            </View>
            {subtitle && <Text style={subtitleStyle}>{subtitle}</Text>}
            {linkUrl && !isCertOrAward && <Link style={styles.projectLink} src={linkUrl}>{linkUrl}</Link>}
            {linkUrl && isCertOrAward && 
                <Link style={styles.certAwardLink} src={linkUrl}>
                    <Text>View Credential</Text>
                </Link>
            }
            {technologies && technologies.length > 0 && (
                <Text style={styles.projectTech}>Technologies: {technologies.join(', ')}</Text>
            )}
            {descriptionPoints.length > 0 && descriptionPoints.map((point, index) => (
                <View key={index} style={styles.bulletPoint}>
                    <Text style={styles.bullet}>▪</Text> 
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

const TemplateCreative: React.FC<TemplateProps> = ({ profileData }) => {
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
        <Document title={`${profileData.name} CV - Creative`}>
            <Page size="A4" style={styles.page}>
                {/* --- Header --- */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.name}>{profileData.name || 'User Name'}</Text>
                        <Text style={styles.jobTitle}>{profileData.jobTitle || 'Creative Professional'}</Text>
                    </View>
                    <View style={styles.contactInfoContainer}>
                        {profileData.phone && <Text style={styles.contactItem}>{profileData.phone}</Text>}
                        {profileData.email && <Text style={styles.contactItem}>{profileData.email}</Text>}
                        {profileData.address && <Text style={styles.contactItem}>{profileData.address}</Text>}
                        {profileData.linkedIn && 
                            <Link style={styles.contactLink} src={profileData.linkedIn}>
                                <Text>LinkedIn</Text>
                            </Link>
                        }
                         {profileData.portfolio && 
                            <Link style={styles.contactLink} src={profileData.portfolio}>
                                <Text>Portfolio</Text>
                            </Link>
                        }
                    </View>
                </View>

                {/* --- Main Content --- */}
                <View style={styles.mainContent}>
                    {/* Summary */}
                    {profileData.aboutMe && (
                        <Section title="Profile Summary">
                            <Text style={styles.itemDescription}>{profileData.aboutMe}</Text>
                        </Section>
                    )}

                    {/* Experience */}
                    {experience.length > 0 && (
                        <Section title="Experience">
                            {experience.map((exp, index) => (
                                <ListItem
                                    key={exp._id || index}
                                    title={exp.jobTitle || 'N/A'}
                                    subtitle={exp.companyName || 'N/A'}
                                    dateRange={`${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}`}
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
                                    description={proj.description}
                                    linkUrl={proj.url}
                                    technologies={proj.technologiesUsed}
                                />
                            ))}
                        </Section>
                    )}

                    {/* Education */}
                    {education.length > 0 && (
                        <Section title="Education">
                            {education.map((edu, index) => (
                                <ListItem
                                    key={edu._id || index}
                                    title={edu.degree || 'N/A'}
                                    subtitle={edu.school || 'N/A'}
                                    dateRange={`${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}`}
                                    description={edu.description}
                                />
                            ))}
                        </Section>
                    )}
                    
                    {/* Skills */}
                    {skills.length > 0 && (
                        <Section title="Skills">
                            <View style={styles.skillsContainer}>
                                {skills.map((skill, index) => (
                                    <Text key={index} style={styles.skillItem}>{skill}</Text>
                                ))}
                             </View>
                        </Section>
                    )}

                    {/* Certificates & Awards (Combined or separate) */}
                    {(certificates.length > 0 || awards.length > 0) && (
                        <Section title="Certificates & Awards">
                            {certificates.map((cert, index) => (
                                <ListItem
                                    key={`cert-${cert._id || index}`}
                                    title={cert.name || 'N/A'}
                                    subtitle={cert.issuingOrganization}
                                    issueDate={formatDate(cert.issueDate)}
                                    linkUrl={cert.credentialUrl} 
                                    isCertOrAward={true}
                                />
                            ))}
                            {awards.map((award, index) => (
                                 <ListItem
                                    key={`award-${award._id || index}`}
                                    title={award.name || 'N/A'}
                                    subtitle={award.issuingOrganization}
                                    issueDate={formatDate(award.issueDate)}
                                    description={award.description} // Display description for awards
                                    isCertOrAward={true}
                                />
                            ))}
                        </Section>
                    )}

                </View>

                 {/* Footer */}
                 <Text style={styles.footer} fixed>
                     Generated by IT SMART HIRE - {format(new Date(), 'MM/dd/yyyy')}
                 </Text>
            </Page>
        </Document>
    );
};

export default TemplateCreative; 