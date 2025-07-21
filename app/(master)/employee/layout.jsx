import React, { ReactNode } from 'react'
import { Metadata } from 'next';

export const metadata = {
  title: "Sadana - Employee Management System",
  description: "A comprehensive solution for managing employee data, attendance, and leave applications.",
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