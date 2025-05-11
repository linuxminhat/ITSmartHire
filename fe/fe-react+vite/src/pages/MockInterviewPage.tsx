// import { useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button'; // Shadcn UI
// import { Input } from '@/components/ui/input'; // Shadcn UI
// import { toast } from 'react-toastify';
// import questionsData from '@/data/questions.json'; // File câu hỏi

// const MockInterviewPage = () => {
//     const [field, setField] = useState('');
//     const [started, setStarted] = useState(false);
//     const [currentQuestion, setCurrentQuestion] = useState(null);
//     const [answer, setAnswer] = useState('');
//     const [timeLeft, setTimeLeft] = useState(60); // 60 giây cho mỗi câu
//     const [questionIndex, setQuestionIndex] = useState(0);
//     const [answers, setAnswers] = useState([]);

//     // Lấy câu hỏi ngẫu nhiên
//     const getRandomQuestion = (field) => {
//         const fieldData = questionsData.find((data) => data.field === field);
//         if (!fieldData) return null;
//         const randomIndex = Math.floor(Math.random() * fieldData.questions.length);
//         return fieldData.questions[randomIndex];
//     };

//     // Bắt đầu phỏng vấn
//     const handleStart = () => {
//         if (!field) {
//             toast.error('Please select a field!');
//             return;
//         }
//         setStarted(true);
//         setCurrentQuestion(getRandomQuestion(field));
//         setTimeLeft(60);
//         toast.success('Interview started!');
//     };

//     // Đếm ngược thời gian
//     useEffect(() => {
//         if (started && timeLeft > 0) {
//             const timer = setInterval(() => {
//                 setTimeLeft((prev) => prev - 1);
//             }, 1000);
//             return () => clearInterval(timer);
//         } else if (timeLeft === 0) {
//             handleNextQuestion();
//         }
//     }, [started, timeLeft]);

//     // Gửi câu trả lời và chuyển câu hỏi tiếp theo
//     const handleNextQuestion = () => {
//         setAnswers([...answers, { question: currentQuestion, answer }]);
//         setAnswer('');
//         setTimeLeft(60);
//         setQuestionIndex(questionIndex + 1);
//         if (questionIndex + 1 >= 5) { // Giả sử 5 câu hỏi mỗi phiên
//             setStarted(false);
//             toast.success('Interview completed!');
//             return;
//         }
//         setCurrentQuestion(getRandomQuestion(field));
//     };

//     return (
//         <div className="container mx-auto p-4">
//             <h1 className="text-2xl font-bold mb-4">Mock Interview</h1>
//             {!started ? (
//                 <div>
//                     <select
//                         value={field}
//                         onChange={(e) => setField(e.target.value)}
//                         className="border p-2 rounded"
//                     >
//                         <option value="">Select a field</option>
//                         <option value="Frontend">Frontend</option>
//                         <option value="Backend">Backend</option>
//                         <option value="Behavioral">Behavioral</option>
//                     </select>
//                     <Button onClick={handleStart} className="ml-4">
//                         Start Interview
//                     </Button>
//                 </div>
//             ) : (
//                 <div>
//                     <div className="mb-4">
//                         <p className="text-lg font-semibold">Question {questionIndex + 1}:</p>
//                         <p>{currentQuestion?.text}</p>
//                         <p className="text-sm text-gray-500">Time left: {timeLeft}s</p>
//                     </div>
//                     <Input
//                         value={answer}
//                         onChange={(e) => setAnswer(e.target.value)}
//                         placeholder="Type your answer here..."
//                         className="mb-4"
//                     />
//                     <Button onClick={handleNextQuestion}>Next Question</Button>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default MockInterviewPage;