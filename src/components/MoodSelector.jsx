// src/components/MoodSelector.jsx
import React from 'react';

const MoodSelector = ({ currentMood, onMoodSelect }) => {
  const moods = ['work', 'date', 'quick bite', 'budget'];

  return (
    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
      {moods.map((mood) => (
        <button
          key={mood}
          onClick={() => onMoodSelect(mood)}
          style={{
            padding: '10px 20px',
            backgroundColor: currentMood === mood ? '#4CAF50' : '#f0f0f0',
            color: currentMood === mood ? 'white' : 'black',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          {mood}
        </button>
      ))}
    </div>
  );
};

export default MoodSelector;