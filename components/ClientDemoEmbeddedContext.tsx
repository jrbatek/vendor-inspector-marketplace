"use client";

import { createContext } from "react";

/** Browser-local presentation flag. Never used for authentication or DB routing. */
export const ClientDemoEmbeddedContext = createContext(false);
