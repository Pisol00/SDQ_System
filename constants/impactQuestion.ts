// SDQ Impact Supplement Questions
export const impactQuestions = {
  // คำถามหลัก - ถ้าตอบ "ไม่" จะหยุด
  mainQuestion: {
    id: 'hasProblems',
    text: 'โดยรวมแล้วคุณคิดว่า เด็กมีปัญหาในด้านใดด้านหนึ่งต่อไปนี้หรือไม่ ด้านอารมณ์ ด้านสมาธิ ด้านพฤติกรรม หรือความสามารถเข้ากับผู้อื่น',
    options: [
      { value: 0, label: 'ไม่' },
      { value: 1, label: 'ใช่ มีปัญหาเล็กน้อย' },
      { value: 2, label: 'ใช่ มีปัญหาชัดเจน' },
      { value: 3, label: 'ใช่ มีปัญหาอย่างมาก' }
    ]
  },

  // คำถามต่อเนื่อง (แสดงเมื่อตอบ "ใช่" ในข้อแรก)
  followUpQuestions: [
    {
      id: 'duration',
      text: 'ปัญหานี้เกิดขึ้นมานานแห่งแล้ว',
      options: [
        { value: 0, label: 'น้อยกว่า 1 เดือน' },
        { value: 1, label: '1 - 5 เดือน' },
        { value: 2, label: '6 - 12 เดือน' },
        { value: 3, label: 'มากกว่า 1 ปี' }
      ]
    },
    {
      id: 'distress',
      text: 'ปัญหานี้ทำให้นักเรียนรู้สึกไม่สบายใจหรือไม่',
      options: [
        { value: 0, label: 'ไม่เลย' },
        { value: 1, label: 'เล็กน้อย' },
        { value: 2, label: 'ค่อนข้างมาก' },
        { value: 3, label: 'มาก' }
      ]
    },
    {
      id: 'impactFriends',
      text: 'ปัญหานี้รบกวนชีวิตประจำวันของเด็กในด้าน: การคบเพื่อน',
      options: [
        { value: 0, label: 'ไม่' },
        { value: 1, label: 'เล็กน้อย' },
        { value: 2, label: 'ค่อนข้างมาก' },
        { value: 3, label: 'มาก' }
      ]
    },
    {
      id: 'impactLearning',
      text: 'ปัญหานี้รบกวนชีวิตประจำวันของเด็กในด้าน: การเรียนในห้องเรียน',
      options: [
        { value: 0, label: 'ไม่' },
        { value: 1, label: 'เล็กน้อย' },
        { value: 2, label: 'ค่อนข้างมาก' },
        { value: 3, label: 'มาก' }
      ]
    },
    {
      id: 'burdenOthers',
      text: 'ปัญหาของเด็กทำให้คุณหรือขั้นเรียนเกิดความยุ่งยากหรือไม่ (ครอบครัว เพื่อน ครู เป็นต้น)',
      options: [
        { value: 0, label: 'ไม่เลย' },
        { value: 1, label: 'เล็กน้อย' },
        { value: 2, label: 'ค่อนข้างมาก' },
        { value: 3, label: 'มาก' }
      ]
    }
  ]
};

export interface ImpactResponse {
  hasProblems: number;
  duration?: number;
  distress?: number;
  impactFriends?: number;
  impactLearning?: number;
  burdenOthers?: number;
}

export interface ImpactQuestion {
  id: string;
  text: string;
  options: Array<{
    value: number;
    label: string;
  }>;
}