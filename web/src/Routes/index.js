import React from 'react';
import { Routes, Route } from "react-router-dom";

//Layouts
import NonAuthLayout from "../Layouts/NonAuthLayout";
import VerticalLayout from "../Layouts/index";

//routes
import { authProtectedRoutes, publicRoutes } from "./allRoutes";
import { AuthProtected } from './AuthProtected';

const Index = () => {
    return (
        <Routes>
            {/* Public Routes */}
            {publicRoutes.map((route, idx) => (
                <Route
                    key={idx}
                    path={route.path}
                    element={<NonAuthLayout>{route.component}</NonAuthLayout>}
                />
            ))}

            {/* Protected Routes */}
            {authProtectedRoutes.map((route, idx) => (
                <Route
                    key={idx}
                    path={route.path}
                    element={
                        <AuthProtected>
                            <VerticalLayout>{route.component}</VerticalLayout>
                        </AuthProtected>
                    }
                />
            ))}

            {/* Optional: Catch all route for 404 */}
            <Route path="*" element={<NonAuthLayout>Page Not Found</NonAuthLayout>} />
        </Routes>
    );
};

export default Index;
