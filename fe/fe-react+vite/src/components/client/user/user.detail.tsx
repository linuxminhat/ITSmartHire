import { IUser } from "@/types/backend";
import { Avatar, Card, Col, Descriptions, Row, Skeleton, Tag } from "antd";
import { useState, useEffect } from 'react';
import { callFetchUserById } from "@/config/api";
import styles from 'styles/client.module.scss';
import { useParams } from "react-router-dom";

const UserDetail = () => {
    const [userDetail, setUserDetail] = useState<IUser | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const params = useParams();
    const id = params?.id; // user id

    useEffect(() => {
        const fetchUserDetail = async () => {
            if (id) {
                setIsLoading(true);
                // Lưu ý: Bạn cần tạo function callFetchUserById trong config/api.ts
                try {
                    const res = await callFetchUserById(id);
                    if (res?.data) {
                        setUserDetail(res.data);
                    }
                } catch (error) {
                    console.error("Failed to fetch user details:", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchUserDetail();
    }, [id]);

    return (
        <div className={`${styles["container"]} ${styles["detail-user-section"]}`}>
            {isLoading ? (
                <Skeleton active avatar paragraph={{ rows: 4 }} />
            ) : (
                <>
                    {userDetail && (
                        <Row gutter={[20, 20]}>
                            <Col span={24} md={8}>
                                <Card bordered={false} className={styles["user-card"]}>
                                    <div style={{ textAlign: 'center' }}>
                                        <Avatar
                                            size={120}
                                            style={{ backgroundColor: '#87d068' }}
                                        >
                                            {userDetail?.name?.substring(0, 2)?.toUpperCase()}
                                        </Avatar>
                                        <h2 style={{ marginTop: 16 }}>{userDetail.name}</h2>
                                        <p>{userDetail.email}</p>
                                    </div>
                                </Card>
                            </Col>
                            <Col span={24} md={16}>
                                <Card title="Thông tin chi tiết" bordered={false}>
                                    <Descriptions bordered column={1} labelStyle={{ fontWeight: 'bold' }}>
                                        <Descriptions.Item label="Tên">{userDetail.name}</Descriptions.Item>
                                        <Descriptions.Item label="Email">{userDetail.email}</Descriptions.Item>
                                        <Descriptions.Item label="Tuổi">{userDetail.age}</Descriptions.Item>
                                        <Descriptions.Item label="Giới tính">{userDetail.gender}</Descriptions.Item>
                                        <Descriptions.Item label="Địa chỉ">{userDetail.address}</Descriptions.Item>
                                        <Descriptions.Item label="Công ty">
                                            {userDetail.company?.name || "Chưa cập nhật"}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Vai trò">
                                            <Tag color="blue">{userDetail.role?.name || "User"}</Tag>
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>
                            </Col>
                        </Row>
                    )}
                </>
            )}
        </div>
    );
};

export default UserDetail;