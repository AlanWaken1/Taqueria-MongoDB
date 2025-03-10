import React from 'react';

export default function Card({ title, children, className = '', footer = null }) {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {title && (
        <div className="border-b border-gray-200 px-5 py-3">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
      )}
      <div className="p-5">
        {children}
      </div>
      {footer && (
        <div className="border-t border-gray-200 px-5 py-3 bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  );
}

export function StatsCard({ title, value, delta = null, icon, iconColor = 'text-blue-500', iconBgColor = 'bg-blue-100', href = null, className = '' }) {
  const content = (
    <div className={`flex items-center justify-between p-5 ${className}`}>
      <div>
        <div className="text-sm font-medium text-gray-500">{title}</div>
        <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
        {delta && (
          <div className={`flex items-center mt-1 ${delta.type === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
            {delta.type === 'increase' ? (
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
              </svg>
            )}
            <span className="text-sm font-medium">{delta.value}</span>
          </div>
        )}
      </div>
      <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${iconBgColor}`}>
        <span className={`text-2xl ${iconColor}`}>{icon}</span>
      </div>
    </div>
  );
  
  if (href) {
    return (
      <a href={href} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {content}
      </a>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {content}
    </div>
  );
}