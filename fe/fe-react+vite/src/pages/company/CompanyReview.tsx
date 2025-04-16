import React, { useState, useEffect } from 'react';
import { Avatar, Button, Divider, Form, Input, List, Rate } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import styles from 'styles/client.module.scss';
import { Comment } from '@ant-design/compatible';

const { TextArea } = Input;

// Interface for comment structure
interface IComment {
    id: string;
    author: string;
    avatar?: string;
    content: string;
    rating: number;
    datetime: string;
}

interface CompanyReviewProps {
    companyId: string;
    companyName: string;
}

// Comment form component
const CommentForm = ({ onSubmit }: { onSubmit: (comment: Omit<IComment, 'id' | 'datetime'>) => void }) => {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = () => {
        form.validateFields().then(values => {
            setSubmitting(true);

            // Send data to parent component
            onSubmit({
                author: values.author,
                content: values.content,
                rating: values.rating
            });

            // Reset form and submitting state
            setSubmitting(false);
            form.resetFields();
        });
    };

    return (
        <Form form={form} layout="vertical">
            <Form.Item name="author" rules={[{ required: true, message: 'Vui lòng nhập tên của bạn!' }]}>
                <Input prefix={<UserOutlined />} placeholder="Tên của bạn" />
            </Form.Item>

            <Form.Item name="rating" rules={[{ required: true, message: 'Vui lòng đánh giá!' }]}>
                <Rate />
            </Form.Item>

            <Form.Item name="content" rules={[{ required: true, message: 'Vui lòng nhập nội dung đánh giá!' }]}>
                <TextArea rows={4} placeholder="Chia sẻ đánh giá của bạn về công ty này..." />
            </Form.Item>

            <Form.Item>
                <Button htmlType="submit" loading={submitting} onClick={handleSubmit} type="primary">
                    Gửi đánh giá
                </Button>
            </Form.Item>
        </Form>
    );
};

const CompanyReview: React.FC<CompanyReviewProps> = ({ companyId, companyName }) => {
    const [comments, setComments] = useState<IComment[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        fetchCompanyComments(companyId);
    }, [companyId]);

    // Mock function to fetch comments - replace with actual API call
    const fetchCompanyComments = async (companyId: string) => {
        setLoading(true);
        try {
            // In a real application, you would call your API here
            // const response = await callFetchCompanyComments(companyId);
            // setComments(response.data);

            // For now, let's use some mock data
            setTimeout(() => {
                setComments([
                    {
                        id: '1',
                        author: 'Nguyễn Văn A',
                        avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
                        content: 'Công ty có môi trường làm việc tốt, đồng nghiệp thân thiện.',
                        rating: 4,
                        datetime: '2025-04-15 08:30:35'
                    },
                    {
                        id: '2',
                        author: 'Trần Thị B',
                        avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
                        content: 'Chế độ đãi ngộ tốt, nhưng áp lực công việc hơi cao.',
                        rating: 3,
                        datetime: '2025-04-10 14:22:51'
                    }
                ]);
                setLoading(false);
            }, 500);
        } catch (error) {
            console.error("Error fetching company comments:", error);
            setLoading(false);
        }
    };

    // Handle adding a new comment
    const handleAddComment = async (commentData: Omit<IComment, 'id' | 'datetime'>) => {
        const newComment: IComment = {
            ...commentData,
            id: Date.now().toString(), // Generate a temporary ID
            datetime: new Date().toISOString() // Current timestamp
        };

        // In a real application, you would call your API here
        // await callAddCompanyComment(companyId, newComment);

        // For now, we'll just update the local state
        setComments([newComment, ...comments]);
    };

    // Calculate average rating
    const averageRating = comments.length > 0
        ? comments.reduce((acc, comment) => acc + comment.rating, 0) / comments.length
        : 0;

    return (
        <div className={styles["review-section"]}>
            <h3>Đánh giá của mọi người về {companyName}</h3>

            {comments.length > 0 && (
                <div className={styles["average-rating"]}>
                    <span>Đánh giá trung bình: </span>
                    <Rate disabled allowHalf value={averageRating} />
                    <span> ({averageRating.toFixed(1)}/5 từ {comments.length} đánh giá)</span>
                </div>
            )}

            {/* Comment form */}
            <div className={styles["comment-form"]}>
                <h4>Viết đánh giá của bạn</h4>
                <CommentForm onSubmit={handleAddComment} />
            </div>

            <Divider />

            {/* Comment list */}
            <List
                className={styles["comment-list"]}
                header={`${comments.length} đánh giá`}
                itemLayout="horizontal"
                loading={loading}
                dataSource={comments}
                locale={{ emptyText: "Chưa có đánh giá nào cho công ty này" }}
                renderItem={item => (
                    <li>
                        <Comment
                            author={<a>{item.author}</a>}
                            avatar={<Avatar src={item.avatar} alt={item.author} />}
                            content={
                                <>
                                    <Rate disabled defaultValue={item.rating} />
                                    <p>{item.content}</p>
                                </>
                            }
                            datetime={item.datetime}
                        />
                    </li>
                )}
            />
        </div>
    );
};

export default CompanyReview;