import React, { ReactNode } from 'react'
import { Metadata } from 'next';

export const metadata = {
  title: "Sadana - Activity report",
  description: "Generate and manage activity reports efficiently with Sadana.",
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