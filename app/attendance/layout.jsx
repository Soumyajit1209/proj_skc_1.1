import React, { ReactNode } from 'react'
import { Metadata } from 'next';

export const metadata = {
  title: "Sadana - Attendance Management",
  description: "Manage employee attendance efficiently with Sadana.",
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