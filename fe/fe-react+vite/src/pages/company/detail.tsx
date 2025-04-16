// import { useLocation } from "react-router-dom";
// import { useState, useEffect } from "react";
// import { ICompany } from "@/types/backend";
// import { callFetchCompanyById } from "@/config/api";
// import styles from "styles/client.module.scss";
// import parse from "html-react-parser";
// import { Col, Divider, Row, Skeleton, Tabs } from "antd";
// import { EnvironmentOutlined } from "@ant-design/icons";
// import CompanyReview from '@/pages/company/CompanyReview'; // Điều chỉnh đường dẫn import

// const { TabPane } = Tabs;

// const ClientCompanyDetailPage = (props: any) => {
//     const [companyDetail, setCompanyDetail] = useState<ICompany | null>(null);
//     const [isLoading, setIsLoading] = useState<boolean>(false);
//     const [activeTab, setActiveTab] = useState<string>("introduce");

//     const location = useLocation();
//     const params = new URLSearchParams(location.search);
//     const id = params?.get("id"); // company id

//     useEffect(() => {
//         const init = async () => {
//             if (id) {
//                 setIsLoading(true);
//                 const res = await callFetchCompanyById(id);
//                 if (res?.data) {
//                     setCompanyDetail(res.data);
//                 }
//                 setIsLoading(false);
//             }
//         };
//         init();
//     }, [id]);

//     return (
//         <div className={`${styles["container"]} ${styles["detail-job-section"]}`}>
//             {isLoading ? (
//                 <Skeleton />
//             ) : (
//                 <>
//                     {companyDetail && companyDetail._id && (
//                         <Row gutter={[20, 20]}>
//                             <Col span={24} md={16}>
//                                 {/* Tên công ty */}
//                                 <div className={styles["header"]}>{companyDetail.name}</div>

//                                 {/* Địa chỉ */}
//                                 <div className={styles["location"]}>
//                                     <EnvironmentOutlined style={{ color: "#58aaab" }} />
//                                     &nbsp;{companyDetail?.address}
//                                 </div>

//                                 <Divider />

//                                 {/* Tabs - Đã sắp xếp lại theo thứ tự mới */}
//                                 <Tabs
//                                     defaultActiveKey="introduce"
//                                     type="card"
//                                     tabBarGutter={16}
//                                     activeKey={activeTab}
//                                     onChange={setActiveTab}
//                                 >
//                                     {/* Tab 1 - Giới thiệu */}
//                                     <TabPane tab="Giới thiệu chung" key="introduce">
//                                         {parse(companyDetail?.description ?? "")}
//                                     </TabPane>

//                                     {/* Tab 2 - Bản đồ */}
//                                     <TabPane tab="Bản đồ" key="map">
//                                         <div style={{ width: "100%", height: "400px", position: "relative" }}>
//                                             <iframe
//                                                 width="100%"
//                                                 height="100%"
//                                                 style={{ border: 0 }}
//                                                 loading="lazy"
//                                                 allowFullScreen
//                                                 referrerPolicy="no-referrer-when-downgrade"
//                                                 src={`https://www.google.com/maps?q=${companyDetail.latitude},${companyDetail.longitude}&hl=vi&z=14&output=embed`}
//                                             />
//                                         </div>
//                                     </TabPane>


//                                     {/* Tab 3 - Đánh giá */}
//                                     <TabPane tab="Đánh giá" key="reviews">
//                                         {companyDetail._id && (
//                                             <CompanyReview
//                                                 companyId={companyDetail._id}
//                                                 companyName={companyDetail?.name || ""}
//                                             />
//                                         )}
//                                     </TabPane>
//                                 </Tabs>
//                             </Col>

//                             <Col span={24} md={8}>
//                                 <div className={styles["company"]}>
//                                     <div>
//                                         <img
//                                             alt="example"
//                                             src={`${import.meta.env.VITE_BACKEND_URL}/images/company/${companyDetail?.logo}`}
//                                         />
//                                     </div>
//                                     <div>{companyDetail?.name}</div>
//                                 </div>
//                             </Col>
//                         </Row>
//                     )}
//                 </>
//             )}
//         </div>
//     );
// };

// export default ClientCompanyDetailPage;
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { ICompany } from "@/types/backend";
import { callFetchCompanyById } from "@/config/api";
import styles from "styles/client.module.scss";
import parse from "html-react-parser";
import { Col, Divider, Row, Skeleton, Tabs } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import CompanyReview from '@/pages/company/CompanyReview';

const { TabPane } = Tabs;

const ClientCompanyDetailPage = (props: any) => {
    const [companyDetail, setCompanyDetail] = useState<ICompany | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<string>("introduce");

    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const id = params?.get("id"); // company id

    useEffect(() => {
        const init = async () => {
            if (id) {
                setIsLoading(true);
                const res = await callFetchCompanyById(id);
                if (res?.data) {
                    setCompanyDetail(res.data);
                }
                setIsLoading(false);
            }
        };
        init();
    }, [id]);

    return (
        <div className={`${styles["container"]} ${styles["detail-job-section"]}`}>
            {isLoading ? (
                <Skeleton />
            ) : (
                <>
                    {companyDetail && companyDetail._id && (
                        <Row gutter={[20, 20]}>
                            <Col span={24} md={16}>
                                {/* Tên công ty */}
                                <div className={styles["header"]}>{companyDetail.name}</div>

                                {/* Địa chỉ */}
                                <div className={styles["location"]}>
                                    <EnvironmentOutlined style={{ color: "#58aaab" }} />
                                    &nbsp;{companyDetail?.address}
                                </div>

                                <Divider />

                                {/* Tabs - Đã sắp xếp lại theo thứ tự mới */}
                                <Tabs
                                    defaultActiveKey="introduce"
                                    type="card"
                                    tabBarGutter={16}
                                    activeKey={activeTab}
                                    onChange={setActiveTab}
                                >
                                    {/* Tab 1 - Giới thiệu */}
                                    <TabPane tab="Giới thiệu chung" key="introduce">
                                        {parse(companyDetail?.description ?? "")}
                                    </TabPane>

                                    {/* Tab 2 - Bản đồ */}
                                    <TabPane tab="Bản đồ" key="map">
                                        <div style={{ width: "100%", height: "400px", position: "relative" }}>
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                style={{ border: 0 }}
                                                loading="lazy"
                                                allowFullScreen
                                                referrerPolicy="no-referrer-when-downgrade"
                                                src={`https://www.google.com/maps?q=${companyDetail.latitude},${companyDetail.longitude}&hl=vi&z=14&output=embed`}
                                            />
                                        </div>
                                    </TabPane>


                                    {/* Tab 3 - Đánh giá */}
                                    <TabPane tab="Đánh giá" key="reviews">
                                        {companyDetail._id && (
                                            <CompanyReview
                                                companyId={companyDetail._id}
                                                companyName={companyDetail?.name || ""}
                                            />
                                        )}
                                    </TabPane>
                                </Tabs>
                            </Col>

                            <Col span={24} md={8}>
                                <div className={styles["company"]}>
                                    <div>
                                        <img
                                            alt="example"
                                            src={`${import.meta.env.VITE_BACKEND_URL}/images/company/${companyDetail?.logo}`}
                                        />
                                    </div>
                                    <div>{companyDetail?.name}</div>
                                </div>

                            </Col>
                        </Row>
                    )}
                </>
            )}
        </div>
    );
};

export default ClientCompanyDetailPage;