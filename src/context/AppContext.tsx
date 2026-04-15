import React, { createContext, useContext, useState, useEffect } from 'react';

type Role = 'student' | 'lecturer' | null;

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  subjectCode: string;
  setSubjectCode: (code: string) => void;
  isMockMode: boolean;
  setIsMockMode: (val: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<Role>(() => {
    const saved = localStorage.getItem('role');
    return (saved as Role) || null;
  });
  const [subjectCode, setSubjectCode] = useState<string>('21CS61'); // Default subject
  const [isMockMode, setIsMockMode] = useState<boolean>(false);

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    if (newRole) {
      localStorage.setItem('role', newRole);
    } else {
      localStorage.removeItem('role');
    }
  };

  return (
    <AppContext.Provider value={{ role, setRole, subjectCode, setSubjectCode, isMockMode, setIsMockMode }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
