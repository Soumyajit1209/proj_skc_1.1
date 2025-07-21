import React, { ReactNode } from 'react'
import { Metadata } from 'next';

export const metadata = {
  title: "Sadana - Change Password",
  description: "Securely change your password with Sadana.",
  icons :{
    icon : '/logo.png'
  }
};


const RootLayout = ({children}) => {
  return (
   <main>
    
   
    {children}
  
   
   </main>
  )
}

export default RootLayout