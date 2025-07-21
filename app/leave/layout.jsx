
import React, { ReactNode } from 'react'
import { Metadata } from 'next';

export const metadata = {
  title: "Sadana - Leave management",
  description: "Manage your leave applications efficiently with Sadana.",
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