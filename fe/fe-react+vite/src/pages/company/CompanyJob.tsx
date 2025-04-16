// // CompanyJobs.tsx
// import { useState, useEffect } from "react";
// import { IJob } from "@/types/backend";
// import { callFetchJobsByCompany } from "@/config/api";
// import styles from "@/styles/client.module.scss";
// import { Card, Tag, Row, Col, Skeleton } from "antd";
// import { EnvironmentOutlined, FireOutlined } from "@ant-design/icons";
// import { useNavigate } from "react-router-dom";

// interface IProps {
//     companyId: string;
// }

// const CompanyJobs = (props: IProps) => {
//     const { companyId } = props;
//     const [jobs, setJobs] = useState<IJob[]>([]);
//     const [loading, setLoading] = useState<boolean>(true);
//     const navigate = useNavigate();

//     useEffect(() => {
//         const fetchJobs = async () => {
//             try {
//                 setLoading(true);
//                 const res = await callFetchJobsByCompany(companyId);
//                 if (res?.data) {
//                     // res.data chính là mảng job trả về từ backend
//                     setJobs(res.data);
//                 }
//             } catch (error) {
//                 console.error("Error fetching jobs:", error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         if (companyId) {
//             fetchJobs();
//         }
//     }, [companyId]);

//     if (loading) {
//         return <Skeleton active paragraph={{ rows: 4 }} />;
//     }

//     if (jobs.length === 0) {
//         // Nếu công ty chưa có job nào thì bạn có thể return null hoặc hiển thị "Chưa có job nào"
//         return null;
//     }

//     const handleViewJob = (jobId: string) => {
//         navigate(`/job?id=${jobId}`);
//     };

//     return (
//         <div className={styles["company-jobs-container"]}>
//             <h2 className={styles["jobs-title"]}>
//                 {jobs.length} việc làm đang tuyển dụng
//             </h2>
//             <div className={styles["jobs-list"]}>
//                 {jobs.map((job) => (
//                     <Card
//                         key={job._id}
//                         className={styles["job-card"]}
//                         onClick={() => job._id ? handleViewJob(job._id) : undefined}
//                         hoverable
//                     >
//                         <Row gutter={[16, 16]}>
//                             <Col span={24}>
//                                 <div className={styles["job-header"]}>
//                                     {/* Nếu job có cờ isHot thì hiển thị tag SUPER HOT */}
//                                     {job.isHot && (
//                                         <Tag color="red" icon={<FireOutlined />}>
//                                             SUPER HOT
//                                         </Tag>
//                                     )}
//                                     <h3>{job.name}</h3>
//                                 </div>
//                                 <div className={styles["job-location"]}>
//                                     <EnvironmentOutlined style={{ color: "#58aaab" }} />
//                                     &nbsp;{job.location}
//                                 </div>
//                             </Col>
//                             <Col span={24}>
//                                 {job.skills && job.skills.length > 0 && (
//                                     <div className={styles["job-skills"]}>
//                                         {job.skills.map((skill, index) => (
//                                             <Tag key={index}>{skill}</Tag>
//                                         ))}
//                                     </div>
//                                 )}
//                             </Col>
//                         </Row>
//                     </Card>
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default CompanyJobs;
