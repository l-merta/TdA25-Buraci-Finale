import React from "react";

interface ErrorProps {
  code: number;
  message: string;
}

const Error: React.FC<ErrorProps> = (props: ErrorProps) => {
  return (
    <main>
      <h1>Error {props.code}</h1>
      <p>{props.message}</p>
    </main>
  );
};

export default Error;