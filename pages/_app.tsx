import {AppProps} from 'next/app';
import React, { createContext, useEffect, useState } from 'react';
import { AURGY_USER_DATA} from '../utils';
import '../styles/globals.scss';
import { indexCookie } from '../utils/cookies';
import { IUserData } from '../utils/user-data';

export interface IAppContext {
  userData: IUserData | null,
  setUserData: (data: IUserData) => void,
  isAuthenticated: boolean;
  signOut: () => void;
}

export const AppContext = createContext<IAppContext>({
  userData: null,
  setUserData: (_data) => null,
  isAuthenticated: false,
  signOut: () => null,
});

function MyApp({ Component, pageProps }: AppProps): React.ReactNode {
  const [ userData, setUserData ] = useState<IUserData | null>(null);
  const [ isAuthenticated, setIsAuthenticated ] = useState(false);

  useEffect(() => {
    const storage = window.localStorage;
    setUserData(JSON.parse(storage.getItem(AURGY_USER_DATA)));

    const signin = async () => {
      const token = indexCookie('token');
      if (!token) return;
      const res = await window.fetch('https://daddy.creativelabsucla.com/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      setUserData(data);
    };

    void signin();
  }, []);

  useEffect(() => {
    const storage = window.localStorage;
    userData
      ? storage.setItem(AURGY_USER_DATA, JSON.stringify(userData))
      : storage.removeItem(AURGY_USER_DATA);

    // If user data is null then we are not authenticated
    setIsAuthenticated(!!userData);
  }, [userData]);

  const signOut = () => {
    document.cookie = undefined;
    setUserData(null);

    // make doubling work here but making sure this is set to null
    setIsAuthenticated(false);
  };

  return (
    <AppContext.Provider value={{
      userData,
      setUserData,
      isAuthenticated,
      signOut,
    }}>
      <Component {...pageProps} />
    </AppContext.Provider>
  );
}

export default MyApp;
