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
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#333333',
        padding: 30,
    },
    // --- Header Section ---
    header: {
        padding: '0 0 20pt 0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        borderBottomWidth: 2,
        borderBottomColor: '#4A5568',
    },
    headerLeft: {
        flex: 1,
    },
    headerRight: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
    },
    name: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2D3748',
        marginBottom: 4,
    },
    jobTitle: {
        fontSize: 14,
        color: '#718096',
        fontStyle: 'italic',
    },
    contactItem: {
        fontSize: 9,
        color: '#4A5568',
        marginLeft: 12,
        lineHeight: 1.4,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: '#4fd1c5', // Teal border
    },
    // --- Main Content Area (Single Column Approach) ---
    mainContent: {
        // Using single column for creative layout variation
    },
    section: {
        marginBottom: 15,
        breakInside: 'avoid',
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
        marginBottom: 10,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0', // Light gray border
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 3,
    },
    itemTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#2d3748',
        flex: 1,
        paddingRight: 10,
        lineHeight: 1.3,
    },
    itemSubtitle: {
        fontSize: 10,
        fontStyle: 'italic',
        color: '#4a5568', // Darker gray
        marginBottom: 4,
    },
    itemDate: {
        fontSize: 9,
        color: '#718096', // Medium gray
        fontWeight: 'bold',
        flexShrink: 0,
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
            <Page size="A4" style={styles.page} wrap={true}>
                {/* --- Header --- */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.name}>{profileData.name || 'User Name'}</Text>
                        <Text style={styles.jobTitle}>{profileData.jobTitle || 'Creative Professional'}</Text>
                    </View>
                    <View style={styles.headerRight}>
                        {profileData.phone && <Text style={styles.contactItem}>{profileData.phone}</Text>}
                        {profileData.email && <Text style={styles.contactItem}>{profileData.email}</Text>}
                        {profileData.address && <Text style={styles.contactItem}>{profileData.address}</Text>}
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