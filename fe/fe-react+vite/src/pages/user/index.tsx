import { useAppSelector } from "@/redux/hooks";
import { Button, Card, Col, Empty, Row } from "antd";
import styles from 'styles/client.module.scss';
import { useNavigate } from "react-router-dom";

const ClientUserPage = () => {
    const navigate = useNavigate();
    const user = useAppSelector(state => state.account.user);
    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);

    if (!isAuthenticated) {
        return (
            <div className={styles["container"]} style={{ marginTop: 20 }}>
                <Empty
                    description="Vui lòng đăng nhập để xem thông tin tài khoản"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                    <Button type="primary" onClick={() => navigate('/login')}>
                        Đăng nhập ngay
                    </Button>
                </Empty>
            </div>
        );
    }

    return (
        <div className={styles["container"]} style={{ marginTop: 20 }}>
            <Row gutter={[20, 20]}>
                <Col span={24}>
                    <Card title="Thông tin người dùng">
                        <p>Chào mừng, <strong>{user.name}</strong>!</p>
                        <p>Bạn có thể quản lý thông tin cá nhân và các hoạt động khác từ đây.</p>
                        <Button
                            type="primary"
                            onClick={() => navigate(`/user/${user._id}`)}
                        >
                            Xem chi tiết tài khoản
                        </Button>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ClientUserPage;