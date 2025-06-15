import React, { createContext, useContext, useState } from 'react';

const SurveyContext = createContext();

export function SurveyProvider({ children }) {
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  return (
    <SurveyContext.Provider value={{ answeredQuestions, setAnsweredQuestions }}>
      {children}
    </SurveyContext.Provider>
  );
}

export function useSurvey() {
  return useContext(SurveyContext);
}
