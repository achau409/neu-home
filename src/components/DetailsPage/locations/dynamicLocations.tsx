"use client";

import { useEffect, useState } from "react";

const useLocation = (): string => {
  const [location, setLocation] = useState<string>("Loading...");

  useEffect(() => {
    const fetchLocation = async (): Promise<void> => {
      try {
        const response = await fetch("http://ip-api.com/json/");
        const data = await response.json();
        setLocation(data.city || "Unknown Location");
      } catch {
        setLocation("Unable to fetch location");
      }
    };
    fetchLocation();
  }, []);

  return location;
};

export default useLocation;
