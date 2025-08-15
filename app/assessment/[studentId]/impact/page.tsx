// app/assessment/[studentId]/impact/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { impactQuestions } from "@/constants/impactQuestion";
import { calculateScores, getInterpretation } from "@/utils/sdqCalculations";
import { showToast } from "@/utils/toast";

interface ImpactAssessmentPageProps {
  params: Promise<{
    studentId: string;
  }>;
}

const ImpactAssessmentPage: React.FC<ImpactAssessmentPageProps> = ({
  params,
}) => {
  const router = useRouter();
  const {
    students,
    getCurrentClassroom,
    getAssessmentByStudentId,
    updateAssessment,
    saveAssessment,
  } = useApp();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [currentAssessment, setCurrentAssessmentLocal] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ เพิ่ม loading state

  // Unwrap params
  const { studentId } = React.use(params);

  // Load student and assessment data
  useEffect(() => {
    const foundStudent = students.find((s) => s.id.toString() === studentId);
    if (!foundStudent) {
      router.push("/students");
      return;
    }

    const assessment = getAssessmentByStudentId(foundStudent.id);
    if (!assessment) {
      router.push(`/assessment/${studentId}`);
      return;
    }

    setStudent(foundStudent);
    setCurrentAssessmentLocal(assessment);
  }, [studentId, students, getAssessmentByStudentId, router]);

  // Prevent navigation away from assessment
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "การประเมินยังไม่เสร็จสิ้น ข้อมูลอาจสูญหาย";
    };

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      showToast.warning("การประเมินยังไม่เสร็จสิ้น");
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    // Add state to prevent back navigation
    window.history.pushState(null, "", window.location.href);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  if (!currentAssessment || !student) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  const impactResponses = currentAssessment.impactResponses || {
    hasProblems: -1,
  };

  const handleMainResponse = (value: number) => {
    const newImpactResponses = {
      hasProblems: value,
      ...(value > 0 ? {} : {}), // เคลียร์คำตอบอื่นๆ ถ้าตอบ "ไม่"
    };

    const updatedAssessment = {
      ...currentAssessment,
      impactResponses: newImpactResponses,
    };

    setCurrentAssessmentLocal(updatedAssessment);
    updateAssessment(updatedAssessment);

    if (value === 0) {
      // ถ้าตอบ "ไม่" ให้เสร็จสิ้นทันที
      setShowFollowUp(false);
    } else {
      // ถ้าตอบ "ใช่" ให้แสดงคำถามต่อเนื่อง
      setShowFollowUp(true);
      setCurrentQuestionIndex(0);
    }
  };

  const handleFollowUpResponse = (questionId: string, value: number) => {
    const newImpactResponses = {
      ...impactResponses,
      [questionId]: value,
    };

    const updatedAssessment = {
      ...currentAssessment,
      impactResponses: newImpactResponses,
    };

    setCurrentAssessmentLocal(updatedAssessment);
    updateAssessment(updatedAssessment);
  };

  const nextFollowUpQuestion = () => {
    if (currentQuestionIndex < impactQuestions.followUpQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const prevFollowUpQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const isCompleted = () => {
    if (impactResponses.hasProblems === 0) {
      return true; // ถ้าตอบ "ไม่" ถือว่าเสร็จ
    }
    if (impactResponses.hasProblems > 0) {
      // ตรวจสอบว่าตอบครบทุกข้อหรือยัง
      return impactQuestions.followUpQuestions.every(
        (q) =>
          impactResponses[q.id as keyof typeof impactResponses] !== undefined
      );
    }
    return false;
  };

  // ✅ แก้ไข handleSaveAssessment ให้มี error handling
  const handleSaveAssessment = async () => {
    if (!currentAssessment) {
      showToast.error("ไม่พบข้อมูลการประเมิน");
      return;
    }

    if (isSubmitting) return; // ป้องกันการกดซ้ำ

    try {
      setIsSubmitting(true);
      showToast.loading("กำลังบันทึกผลการประเมิน...");

      // ตรวจสอบว่ามีคำตอบ SDQ หรือไม่
      if (
        !currentAssessment.responses ||
        Object.keys(currentAssessment.responses).length === 0
      ) {
        throw new Error("ไม่พบคำตอบสำหรับแบบประเมิน SDQ");
      }

      console.log(
        "Calculating scores for responses:",
        currentAssessment.responses
      );

      // คำนวณคะแนนและการแปลผล
      const scores = calculateScores(currentAssessment.responses);
      console.log("Calculated scores:", scores);

      const interpretations = getInterpretation(scores);
      console.log("Generated interpretations:", interpretations);

      // สร้าง completed assessment
      const completedAssessment = {
        ...currentAssessment,
        completed: true,
        scores,
        interpretations,
        completedDate: new Date().toISOString(),
      };

      console.log("Saving completed assessment:", completedAssessment);

      // บันทึกข้อมูล
      saveAssessment(completedAssessment);

      showToast.success(`เสร็จสิ้นการประเมิน ${student.name} เรียบร้อยแล้ว`);

      // รอสักครู่แล้วค่อย redirect
      setTimeout(() => {
        router.push(`/results/${completedAssessment.id}`);
      }, 1000);
    } catch (error) {
      console.error("Error saving assessment:", error);
      showToast.error("เกิดข้อผิดพลาดในการบันทึก: " + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProgress = () => {
    if (impactResponses.hasProblems === -1) return 0;
    if (impactResponses.hasProblems === 0) return 100;

    const answeredQuestions = impactQuestions.followUpQuestions.filter(
      (q) => impactResponses[q.id as keyof typeof impactResponses] !== undefined
    ).length;

    return (
      ((answeredQuestions + 1) /
        (impactQuestions.followUpQuestions.length + 1)) *
      100
    );
  };

  // ✅ แสดง loading screen เมื่อกำลังส่งข้อมูล
  if (isSubmitting) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            กำลังบันทึกผลการประเมิน
          </h2>
          <p className="text-slate-600">กรุณารอสักครู่...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                คำถามเพิ่มเติม
              </h1>
              <div className="text-slate-600 space-y-1 sm:space-y-0">
                <p className="sm:inline">
                  <span className="font-medium">นักเรียน:</span> {student.name}
                </p>
                <p className="sm:inline sm:ml-4">
                  <span className="font-medium">ห้อง:</span>{" "}
                  {getCurrentClassroom().name}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-600">
                  ความคืบหน้า
                </span>
                <span className="text-sm text-slate-500">
                  {Math.round(getProgress())}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgress()}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Question */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            {impactQuestions.mainQuestion.text}
          </h2>

          <div className="space-y-3">
            <button
              onClick={() => handleMainResponse(0)}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                impactResponses.hasProblems === 0
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                    impactResponses.hasProblems === 0
                      ? "border-green-500 bg-green-500"
                      : "border-slate-300"
                  }`}
                >
                  {impactResponses.hasProblems === 0 && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <span className="font-medium">
                  ไม่ มีปัญหาไม่มากหรือไม่มีเลย
                </span>
              </div>
            </button>

            <button
              onClick={() => handleMainResponse(1)}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                impactResponses.hasProblems === 1
                  ? "border-orange-500 bg-orange-50 text-orange-700"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                    impactResponses.hasProblems === 1
                      ? "border-orange-500 bg-orange-500"
                      : "border-slate-300"
                  }`}
                >
                  {impactResponses.hasProblems === 1 && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <span className="font-medium">ใช่ มีปัญหาอย่างแน่นอน</span>
              </div>
            </button>
          </div>
        </div>

        {/* Follow-up Questions */}
        {showFollowUp && impactResponses.hasProblems === 1 && (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">
                  คำถามเพิ่มเติม ({currentQuestionIndex + 1}/
                  {impactQuestions.followUpQuestions.length})
                </h3>
              </div>

              <p className="text-slate-700 mb-4">
                {impactQuestions.followUpQuestions[currentQuestionIndex].text}
              </p>

              <div className="space-y-3 mb-6">
                {impactQuestions.followUpQuestions[
                  currentQuestionIndex
                ].options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      handleFollowUpResponse(
                        impactQuestions.followUpQuestions[currentQuestionIndex]
                          .id,
                        option.value
                      )
                    }
                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                      impactResponses[
                        impactQuestions.followUpQuestions[currentQuestionIndex]
                          .id as keyof typeof impactResponses
                      ] === option.value
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                          impactResponses[
                            impactQuestions.followUpQuestions[
                              currentQuestionIndex
                            ].id as keyof typeof impactResponses
                          ] === option.value
                            ? "border-blue-500 bg-blue-500"
                            : "border-slate-300"
                        }`}
                      >
                        {impactResponses[
                          impactQuestions.followUpQuestions[
                            currentQuestionIndex
                          ].id as keyof typeof impactResponses
                        ] === option.value && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <span className="font-medium">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={prevFollowUpQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ก่อนหน้า
                </button>

                {currentQuestionIndex ===
                impactQuestions.followUpQuestions.length - 1 ? (
                  <button
                    onClick={handleSaveAssessment}
                    disabled={!isCompleted() || isSubmitting}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        กำลังบันทึก...
                      </>
                    ) : (
                      "เสร็จสิ้นการประเมิน"
                    )}
                  </button>
                ) : (
                  <button
                    onClick={nextFollowUpQuestion}
                    disabled={
                      impactResponses[
                        impactQuestions.followUpQuestions[currentQuestionIndex]
                          .id as keyof typeof impactResponses
                      ] === undefined
                    }
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ถัดไป
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Complete Assessment Button for "No Problems" */}
        {impactResponses.hasProblems === 0 && (
          <div className="flex justify-end">
            <button
              onClick={handleSaveAssessment}
              disabled={isSubmitting}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  กำลังบันทึก...
                </>
              ) : (
                "เสร็จสิ้นการประเมิน"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImpactAssessmentPage;
