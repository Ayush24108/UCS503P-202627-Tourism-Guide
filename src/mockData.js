// Pretend data, standing in for what your teammates' database will
// eventually provide. This lets YOU test the chatbot without waiting
// for the backend/database to be finished.

export const mockPlaces = [
  {
    id: 'redfort',
    name: 'Red Fort',
    location: 'Delhi, India',
    historicalBackground: 'Built by Mughal Emperor Shah Jahan starting in 1638, served as the main residence of Mughal emperors for nearly 200 years.',
    culturalImportance: 'Symbol of Indian independence; the Prime Minister raises the flag here every Independence Day.',
    architecture: 'Red sandstone walls, Mughal architecture blending Persian, Timurid and Indian styles.',
    importantEvents: 'Site of the 1857 trial of the last Mughal emperor after the Indian Rebellion.',
    interestingFacts: 'Originally had a moat and the palace interiors were inlaid with precious stones, many removed after colonial-era looting.',
    category: 'fort',
    avgVisitDurationMins: 120,
    area: 'Old Delhi',
  },
  {
    id: 'qutubminar',
    name: 'Qutub Minar',
    location: 'Delhi, India',
    historicalBackground: 'Construction started in 1192 by Qutb-ud-din Aibak, completed by his successor.',
    culturalImportance: 'Tallest brick minaret in the world; UNESCO World Heritage Site.',
    architecture: 'Indo-Islamic architecture, 73 meters tall, tapering tower with intricate carvings.',
    importantEvents: 'Marks the beginning of Muslim rule in India.',
    interestingFacts: 'Contains an iron pillar over 1,600 years old that has never rusted.',
    category: 'monument',
    avgVisitDurationMins: 90,
    area: 'South Delhi',
  },
  {
    id: 'indiagate',
    name: 'India Gate',
    location: 'Delhi, India',
    historicalBackground: 'Built in 1931 as a war memorial for Indian soldiers who died in World War I.',
    culturalImportance: 'National monument, popular gathering spot in the evenings.',
    architecture: '42-meter tall triumphal arch, designed by Edwin Lutyens.',
    importantEvents: 'Houses the Amar Jawan Jyoti (flame honoring unknown soldiers).',
    interestingFacts: 'Names of over 13,000 soldiers are inscribed on the structure.',
    category: 'monument',
    avgVisitDurationMins: 60,
    area: 'Central Delhi',
  },
];
