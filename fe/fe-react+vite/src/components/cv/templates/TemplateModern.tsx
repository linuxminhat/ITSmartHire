import React from 'react';
import { Document, Page, Text, View, StyleSheet, Link, Font } from '@react-pdf/renderer';
import { IUser, IEducation, IExperience, IProject, ICertificate, IAward } from '@/types/backend';
import { format, parseISO } from 'date-fns';


// --- Date Formatting Helper ---
const formatDate = (dateInput: string | Date | undefined | null): string => {
    if (!dateInput) return 'Present';
    try {
        let date: Date;
        if (typeof dateInput === 'string') date = parseISO(dateInput);
        else if (dateInput instanceof Date) date = dateInput;
        else return 'Invalid Date';
        if (isNaN(date.getTime())) return typeof dateInput === 'string' ? dateInput : 'Invalid Date';
        return format(date, 'MM/yyyy');
    } catch (error) {
        console.error("Error formatting date:", dateInput, error);
        return typeof dateInput === 'string' ? dateInput : 'Date Error';
    }
};

// --- Define styles for a Modern template ---
const styles = StyleSheet.create({
    page: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        // fontFamily: 'Open Sans', // Use registered font
        fontFamily: 'Helvetica', // Fallback
        fontSize: 10,
        lineHeight: 1.4,
        color: '#333333',
    },
    // --- Left Column (Narrower - Contact Info, Skills, Education) ---
    leftColumn: {
        width: '35%',
        padding: '25pt',
        backgroundColor: '#2C3E50', // Dark blue-gray sidebar
        color: '#ECF0F1', // Light text color for sidebar
    },
    // --- Right Column (Wider - Main Content) ---
    rightColumn: {
        width: '65%',
        padding: '25pt',
    },
    // --- General Section Styling ---
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 14,
        // fontWeight: 600, // Use semi-bold if font registered
        fontWeight: 'bold',
        color: '#16A085', // Teal accent color for titles
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    sidebarSectionTitle: {
        fontSize: 14,
        // fontWeight: 600,
        fontWeight: 'bold',
        color: '#1ABC9C', // Lighter teal for sidebar titles
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    // --- Header / Personal Info (Left Column) ---
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeight: 1.2,
        marginBottom: 6,
    },
    jobTitle: {
        fontSize: 11,
        color: '#BDC3C7',
        textAlign: 'center',
        marginBottom: 10,
    },
    nameContainer: {
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#1ABC9C',
        paddingBottom: 15,
    },
    contactInfoContainer: {
        marginBottom: 15,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
        fontSize: 9,
        color: '#ECF0F1',
    },
    contactLink: {
        fontSize: 9,
        color: '#ECF0F1',
        textDecoration: 'none',
    },
    iconPlaceholder: { // Placeholder for potential icons
        width: 10,
        height: 10,
        marginRight: 6,
        // backgroundColor: '#1ABC9C' // Example icon color
    },
    // --- Skills (Left Column) ---
    skillItem: {
        fontSize: 9.5,
        marginBottom: 4,
        color: '#ECF0F1',
    },
    // --- Education (Left Column) ---
    educationItem: {
        marginBottom: 10,
    },
    educationDegree: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    educationSchool: {
        fontSize: 9.5,
        color: '#BDC3C7',
        marginBottom: 2,
    },
    educationDate: {
        fontSize: 9,
        color: '#BDC3C7',
    },
    // --- About Me / Summary (Right Column) ---
    summaryText: {
        fontSize: 10,
        textAlign: 'justify',
        color: '#555555', // Darker gray for main text
    },
    // --- Experience & Projects (Right Column) ---
    itemContainer: {
        marginBottom: 12,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 3,
    },
    itemTitle: {
        fontSize: 11,
        fontWeight: 'bold', // Use bold for main titles
        color: '#2C3E50', // Use sidebar color for emphasis
        maxWidth: '80%',
    },
    itemSubtitle: {
        fontSize: 10,
        fontStyle: 'italic',
        color: '#7F8C8D', // Medium gray
        marginBottom: 4,
    },
    itemDate: {
        fontSize: 9,
        color: '#95A5A6', // Lighter gray for dates
        textAlign: 'right',
        minWidth: '50pt',
    },
    itemDescription: {
        fontSize: 10,
        color: '#555555',
    },
    bulletPoint: {
        flexDirection: 'row',
        marginLeft: 10,
        marginBottom: 3,
    },
    bullet: {
        width: 6,
        marginRight: 4,
        marginTop: 1, // Adjust alignment
    },
    // --- Projects Specific (Right Column) ---
    projectLink: {
        fontSize: 9,
        color: '#16A085', // Teal accent color
        textDecoration: 'none',
        marginLeft: 10,
        marginBottom: 3,
    },
    projectTech: {
        fontSize: 9,
        fontStyle: 'italic',
        color: '#7F8C8D',
        marginLeft: 10,
        marginBottom: 3,
    },
    // --- Certificates & Awards (Right Column) ---
    certAwardContainer: {
        marginBottom: 10,
    },
    certAwardTitle: {
        fontSize: 10.5,
        fontWeight: 'bold',
        color: '#2C3E50',
    },
    certAwardSubtitle: {
        fontSize: 9.5,
        color: '#7F8C8D',
        marginBottom: 2,
    },
    certAwardDate: {
        fontSize: 9,
        color: '#95A5A6',
    },
    certAwardLink: {
        fontSize: 9,
        color: '#16A085',
        textDecoration: 'none',
    },
    // --- Footer ---
    footer: {
        position: 'absolute',
        bottom: 15,
        left: 25,
        right: 25,
        textAlign: 'center',
        fontSize: 8,
        color: '#BDC3C7',
    }
});

// --- Reusable Component for Sections (Right Column) ---
const RightSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>
);

// --- Reusable Component for Sections (Left Column) ---
const LeftSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <View style={styles.section}>
        <Text style={styles.sidebarSectionTitle}>{title}</Text>
        {children}
    </View>
);

// --- Reusable Component for Experience/Project Items (Right Column) ---
const DetailListItem: React.FC<{
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
        </View>
    );
};

// --- Main Template Component ---
interface TemplateProps {
    profileData: IUser | null;
}

const TemplateModern: React.FC<TemplateProps> = ({ profileData }) => {
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
        <Document title={`${profileData.name} CV - Modern`}>
            <Page size="A4" style={styles.page}>

                {/* === Left Column === */}
                <View style={styles.leftColumn}>
                    {/* --- Personal Info --- */}
                    <View style={styles.section}>
                        <View style={styles.nameContainer}>
                            <Text style={styles.name}>{profileData.name || 'User Name'}</Text>
                            <Text style={styles.jobTitle}>{profileData.jobTitle || 'Software Developer'}</Text>
                        </View>

                        <LeftSection title="Contact">
                            <View style={styles.contactInfoContainer}>
                                {profileData.phone && <Text style={styles.contactItem}><View style={styles.iconPlaceholder} />{profileData.phone}</Text>}
                                {profileData.email && <Text style={styles.contactItem}><View style={styles.iconPlaceholder} />{profileData.email}</Text>}
                                {profileData.address && <Text style={styles.contactItem}><View style={styles.iconPlaceholder} />{profileData.address}</Text>}
                                {profileData.linkedIn &&
                                    <Link style={styles.contactLink} src={profileData.linkedIn}>
                                        <Text style={styles.contactItem}><View style={styles.iconPlaceholder} />LinkedIn</Text>
                                    </Link>
                                }
                                {profileData.portfolio &&
                                    <Link style={styles.contactLink} src={profileData.portfolio}>
                                        <Text style={styles.contactItem}><View style={styles.iconPlaceholder} />Portfolio</Text>
                                    </Link>
                                }
                            </View>
                        </LeftSection>
                    </View>

                    {/* --- Education --- */}
                    {education.length > 0 && (
                        <LeftSection title="Education">
                            {education.map((edu, index) => (
                                <View key={edu._id || index} style={styles.educationItem}>
                                    <Text style={styles.educationDegree}>{edu.degree || 'N/A'}</Text>
                                    <Text style={styles.educationSchool}>{edu.school || 'N/A'}</Text>
                                    <Text style={styles.educationDate}>
                                        {`${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}`}
                                    </Text>
                                    {/* Optional: Add brief description if needed */}
                                </View>
                            ))}
                        </LeftSection>
                    )}

                    {/* --- Skills --- */}
                    {skills.length > 0 && (
                        <LeftSection title="Skills">
                            {skills.map((skill, index) => (
                                <Text key={index} style={styles.skillItem}>{skill}</Text>
                            ))}
                        </LeftSection>
                    )}
                </View>

                {/* === Right Column === */}
                <View style={styles.rightColumn}>
                    {/* --- Summary / About Me --- */}
                    {profileData.aboutMe && (
                        <RightSection title="Summary">
                            <Text style={styles.summaryText}>{profileData.aboutMe}</Text>
                        </RightSection>
                    )}

                    {/* --- Work Experience --- */}
                    {experience.length > 0 && (
                        <RightSection title="Work Experience">
                            {experience.map((exp, index) => (
                                <DetailListItem
                                    key={exp._id || index}
                                    title={exp.jobTitle || 'N/A'}
                                    subtitle={exp.companyName || 'N/A'}
                                    dateRange={`${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}`}
                                    description={exp.description}
                                />
                            ))}
                        </RightSection>
                    )}

                    {/* --- Projects --- */}
                    {projects.length > 0 && (
                        <RightSection title="Projects">
                            {projects.map((proj, index) => (
                                <DetailListItem
                                    key={proj._id || index}
                                    title={proj.name || 'N/A'}
                                    dateRange={`${formatDate(proj.startDate)} - ${formatDate(proj.endDate)}`}
                                    description={proj.description}
                                    linkUrl={proj.url}
                                    technologies={proj.technologiesUsed}
                                />
                            ))}
                        </RightSection>
                    )}

                    {/* --- Certificates --- */}
                    {certificates.length > 0 && (
                        <RightSection title="Certificates">
                            {certificates.map((cert, index) => (
                                <View key={cert._id || index} style={styles.certAwardContainer}>
                                    <Text style={styles.certAwardTitle}>{cert.name || 'N/A'}</Text>
                                    {cert.issuingOrganization && <Text style={styles.certAwardSubtitle}>{cert.issuingOrganization}</Text>}
                                    {cert.issueDate && <Text style={styles.certAwardDate}>Issued: {formatDate(cert.issueDate)}</Text>}
                                    {cert.credentialUrl &&
                                        <Link style={styles.certAwardLink} src={cert.credentialUrl}>
                                            <Text>{cert.credentialUrl}</Text>
                                        </Link>
                                    }
                                </View>
                            ))}
                        </RightSection>
                    )}

                    {/* --- Awards --- */}
                    {awards.length > 0 && (
                        <RightSection title="Awards">
                            {awards.map((award, index) => (
                                <View key={award._id || index} style={styles.certAwardContainer}>
                                    <Text style={styles.certAwardTitle}>{award.name || 'N/A'}</Text>
                                    {award.issuingOrganization && <Text style={styles.certAwardSubtitle}>{award.issuingOrganization}</Text>}
                                    {award.issueDate && <Text style={styles.certAwardDate}>Date: {formatDate(award.issueDate)}</Text>}
                                    {/* Award description could be added here if desired */}
                                </View>
                            ))}
                        </RightSection>
                    )}
                </View>

                {/* --- Footer --- */}
                <Text style={styles.footer} fixed>
                    Generated by IT SMART HIRE - {format(new Date(), 'MM/dd/yyyy')}
                </Text>
            </Page>
        </Document>
    );
};

export default TemplateModern; 