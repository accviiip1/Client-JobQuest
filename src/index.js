import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ModeContextProvider } from "./context/ModeContext";
import { AuthContextProvider } from "./context/authContext";
import { SocketProvider } from "./context/socketContext";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";

Document.title = "Việc làm & Tuyển dụng SDU-JobQuest";

const queryClient = new QueryClient();
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ModeContextProvider>
        <AuthContextProvider>
          <SocketProvider>
            <App />
          </SocketProvider>
        </AuthContextProvider>
      </ModeContextProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

