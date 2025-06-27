import React from 'react';
import { Document, Page, Text, View, StyleSheet, Link, Font } from '@react-pdf/renderer';
import { IUser, IEducation, IExperience, IProject, ICertificate, IAward } from '@/types/backend';
import { format, parseISO } from 'date-fns';
const formatDate = (dateInput: string | Date | undefined | null): string => {
    if (!dateInput) return 'Present';

    try {
        let date: Date;
        if (typeof dateInput === 'string') {
            date = parseISO(dateInput);
        } else if (dateInput instanceof Date) {
            date = dateInput;
        } else {
            return 'Invalid Date';
        }
        if (isNaN(date.getTime())) {
            console.warn("Invalid date encountered:", dateInput);
            return typeof dateInput === 'string' ? dateInput : 'Invalid Date';
        }

        return format(date, 'MM/yyyy');
    } catch (error) {
        console.error("Error formatting date:", dateInput, error);
        return typeof dateInput === 'string' ? dateInput : 'Date Error';
    }
};

// --- Define styles based on the "Elegant" template ---
const styles = StyleSheet.create({
    page: {
        flexDirection: 'row', // Two columns layout
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica',
        fontSize: 10, // Tăng base font size
        lineHeight: 1.4, // Tăng line height
        color: '#2D3748', // Màu đen đậm hơn
    },
    // --- Left Column (Wider) ---
    leftColumn: {
        width: '68%', // Giảm nhẹ để cân bằng
        padding: '30pt 20pt 30pt 30pt',
    },
    // --- Right Column (Narrower) ---
    rightColumn: {
        width: '32%', // Tăng nhẹ
        padding: '30pt 30pt 30pt 20pt',
        backgroundColor: '#F7FAFC', // Màu xanh nhạt elegant
        color: '#4A5568',
    },
    // --- General Section Styling ---
    section: {
        marginBottom: 16, // Tăng spacing
    },
    sectionTitle: {
        fontSize: 14, // Tăng size
        fontWeight: 'bold',
        color: '#2B6CB0', // Màu xanh đẹp hơn
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5, // Thêm letter spacing
        borderBottomWidth: 2,
        borderBottomColor: '#2B6CB0',
        paddingBottom: 3,
    },
    // --- Header / Personal Info (Right Column) ---
    name: {
        fontSize: 20, // Giảm từ 24 xuống 20
        fontWeight: 'bold',
        marginBottom: 6, // Giảm từ 8 xuống 6
        color: '#1A202C',
        lineHeight: 1.1,
        letterSpacing: 0.2, // Giảm letter spacing
    },
    jobTitle: {
        fontSize: 11, // Giảm từ 13 xuống 11
        color: '#2B6CB0',
        marginBottom: 12, // Giảm từ 16 xuống 12
        lineHeight: 1.2, // Giảm line height
        fontWeight: 'normal',
        fontStyle: 'italic',
    },
    contactInfoContainer: {
        marginBottom: 10, // Giảm từ 12 xuống 10
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        paddingTop: 8, // Giảm từ 12 xuống 8
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4, // Giảm từ 6 xuống 4
        fontSize: 9, // Giảm từ 10 xuống 9
        color: '#4A5568',
        lineHeight: 1.3, // Giảm line height
    },
    contactLabel: {
        width: 12, // Giảm từ 16 xuống 12
        fontSize: 8, // Giảm từ 9 xuống 8
        color: '#718096',
        marginRight: 4, // Giảm từ 6 xuống 4
    },
    // --- About Me (Left Column) ---
    aboutMeText: {
        fontSize: 10.5, // Tăng size
        textAlign: 'justify',
        color: '#4A5568',
        lineHeight: 1.5, // Tăng line height cho dễ đọc
    },
    // --- Experience & Education Items ---
    itemContainer: {
        marginBottom: 12, // Tăng lại spacing
        paddingBottom: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: '#E2E8F0',
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    itemTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#2D3748',
        lineHeight: 1.3,
        flex: 1,
        paddingRight: 8,
    },
    itemSubtitle: {
        fontSize: 9,
        fontStyle: 'italic',
        color: '#2B6CB0',
        marginBottom: 4,
        fontWeight: 'normal',
        lineHeight: 1.3,
        wordBreak: 'break-word',
    },
    itemDate: {
        fontSize: 8,
        color: '#718096',
        textAlign: 'right',
        minWidth: '45pt',
        fontWeight: 'bold',
        lineHeight: 1.1,
        flexShrink: 0,
    },
    itemDescription: {
        fontSize: 9,
        color: '#4A5568',
        lineHeight: 1.4, // Tăng lại line height
    },
    bulletPoint: {
        flexDirection: 'row',
        marginLeft: 10,
        marginBottom: 4, // Tăng lại spacing
        alignItems: 'flex-start',
    },
    bullet: {
        width: 8,
        marginRight: 6,
        fontSize: 10,
        color: '#2B6CB0',
        marginTop: 1,
    },
    // --- Skills (Right Column) ---
    skillsContainer: {
        flexDirection: 'column',
    },
    skillItem: {
        marginBottom: 3, // Giảm từ 4 xuống 3
        fontSize: 9, // Giảm từ 10 xuống 9
        color: '#4A5568',
        paddingLeft: 6, // Giảm từ 8 xuống 6
        borderLeftWidth: 1.5, // Giảm từ 2 xuống 1.5
        borderLeftColor: '#2B6CB0',
        lineHeight: 1.2, // Giảm từ 1.3 xuống 1.2
    },
    // --- Projects (Left Column) ---
    projectLink: {
        fontSize: 8, // Giảm từ 9 xuống 8
        color: '#2B6CB0',
        textDecoration: 'none',
        marginLeft: 8, // Giảm từ 12 xuống 8
        marginBottom: 3, // Giảm từ 4 xuống 3
        fontStyle: 'italic',
        lineHeight: 1.2, // Thêm line height
    },
    projectTech: {
        fontSize: 8.5, // Giảm từ 9.5 xuống 8.5
        fontStyle: 'italic',
        color: '#718096',
        marginLeft: 8, // Giảm từ 12 xuống 8
        marginBottom: 3, // Giảm từ 4 xuống 3
        backgroundColor: '#F7FAFC',
        padding: 2, // Giảm từ 3 xuống 2
        borderRadius: 2,
        lineHeight: 1.2, // Thêm line height
    },
    // --- Certificates & Awards (Right Column) ---
    certAwardDate: {
        fontSize: 8, // Giảm từ 9 xuống 8
        color: '#718096',
        marginBottom: 3, // Giảm từ 4 xuống 3
        fontStyle: 'italic',
        lineHeight: 1.2, // Thêm line height
    },
    certAwardItem: {
        marginBottom: 6, // Giảm từ 8 xuống 6
        paddingBottom: 4, // Giảm từ 6 xuống 4
        borderBottomWidth: 0.5,
        borderBottomColor: '#E2E8F0',
    },
    // --- Links ---
    link: {
        color: '#2B6CB0',
        textDecoration: 'none',
    },
    // --- Footer ---
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 30,
        right: 30,
        textAlign: 'center',
        fontSize: 8,
        color: '#A0AEC0',
        borderTopWidth: 0.5,
        borderTopColor: '#E2E8F0',
        paddingTop: 8,
    }
});

// --- Reusable Component for Sections ---
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>
);

// --- Enhanced ListItem Component ---
const ListItem: React.FC<{
    title: string;
    subtitle?: string;
    dateRange?: string;
    description?: string | string[];
    linkUrl?: string;
    technologies?: string[];
    issueDate?: string;
    isAward?: boolean;
}> = ({ title, subtitle, dateRange, description, linkUrl, technologies, issueDate, isAward = false }) => {

    const fullTitle = title || '';
    const fullSubtitle = subtitle || '';

    const descriptionPoints = typeof description === 'string'
        ? description.split('\n').map(s => s.trim()).filter(s => s !== '')
        : (description || []);

    const containerStyle = isAward ? styles.certAwardItem : styles.itemContainer;

    return (
        <View style={containerStyle}>
            <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{fullTitle}</Text>
                {dateRange && <Text style={styles.itemDate}>{dateRange}</Text>}
            </View>
            {fullSubtitle && <Text style={styles.itemSubtitle}>{fullSubtitle}</Text>}
            {issueDate && <Text style={styles.certAwardDate}>Issued: {issueDate}</Text>}
            {linkUrl && (
                <Link style={styles.projectLink} src={linkUrl}>
                    {linkUrl}
                </Link>
            )}
            {technologies && technologies.length > 0 && (
                <Text style={styles.projectTech}>
                    Tech: {technologies.join(' • ')}
                </Text>
            )}
            {descriptionPoints.length > 0 && descriptionPoints.map((point, index) => (
                <View key={index} style={styles.bulletPoint} wrap={false}>
                    <Text style={styles.bullet}>▸</Text>
                    <Text style={styles.itemDescription}>
                        {point}
                    </Text>
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
            <Page size="A4" style={styles.page} wrap={true}> {/* SỬA: Thêm wrap={true} cho phép content tự động xuống trang */}

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
                </View>

                {/* === Right Column === */}
                <View style={styles.rightColumn}>
                    {/* Personal Details */}
                    <View style={styles.section}>
                        <Text style={styles.name}>{profileData.name || 'User Name'}</Text>
                        <Text style={styles.jobTitle}>Software Developer</Text>

                        <View style={styles.contactInfoContainer}>
                            {profileData.phone && (
                                <View style={styles.contactItem}>
                                    <Text style={styles.contactLabel}>📞</Text>
                                    <Text>{profileData.phone}</Text>
                                </View>
                            )}
                            {profileData.email && (
                                <View style={styles.contactItem}>
                                    <Text style={styles.contactLabel}>✉️</Text>
                                    <Text>{profileData.email}</Text>
                                </View>
                            )}
                            {profileData.address && (
                                <View style={styles.contactItem}>
                                    <Text style={styles.contactLabel}>📍</Text>
                                    <Text>{profileData.address}</Text>
                                </View>
                            )}
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
                                    isAward={true}
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
                                    isAward={true}
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