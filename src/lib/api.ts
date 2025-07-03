// import { stringify } from "qs-esm";
import axiosInstance from "./axios";
export async function fetchPage(slug: string) {
  try {
    const response = await axiosInstance.get("/pages", {
      params: {
        "where[slug][equals]": slug,
        "where[isHomePage][equals]": false,
        "where[status][equals]": "published",
      },
    });

    const pages = response.data?.docs || [];
    return pages.length > 0 ? pages[0] : null;
  } catch (error: any) {
    console.error(
      `Error fetching page with slug "${slug}" and tenant":`,
      error.response?.data || error.message
    );
    return null;
  }
}

export async function fetchPrivacyPolicy() {
  try {
    const response = await axiosInstance.get("/pages", {
      params: {
        "where[slug][equals]": "privacy-policy",
        "where[status][equals]": "published",
      },
    });
    return response.data.docs[0];
  } catch (error: any) {
    console.error(
      `Error fetching privacy policy:`,
      error.response?.data || error.message
    );
    return null;
  }
}
export async function fetchTermsOfUse() {
  try {
    const response = await axiosInstance.get("/pages", {
      params: {
        "where[slug][equals]": "terms",
        "where[status][equals]": "published",
      },
    });
    return response.data.docs[0];
  } catch (error: any) {
    console.error(
      `Error fetching terms of use:`,
      error.response?.data || error.message
    );
    return null;
  }
}
export async function fetchHomePage() {
  try {
    const response = await axiosInstance.get("/pages", {
      params: {
        "where[isHomePage][equals]": true,
        "where[status.status][equals]": "published",
      },
    });

    const pages = response.data?.docs || [];
    return pages.length > 0 ? pages[0] : null;
  } catch (error: any) {
    console.error(
      `Error fetching home page ":`,
      error.response?.data || error.message
    );
    return null;
  }
}
export async function fetchHeader() {
  try {
    const response = await axiosInstance.get("/header");
    return response.data.docs[0];
  } catch (error: any) {
    console.error(
      `Error fetching header:`,
      error.response?.data || error.message
    );
    return null;
  }
}
export async function fetchFooter() {
  try {
    const response = await axiosInstance.get("/footer");
    return response.data.docs[0];
  } catch (error: any) {
    console.error(
      `Error fetching footer:`,
      error.response?.data || error.message
    );
    return null;
  }
}

export async function getServices() {
  try {
    const response = await axiosInstance.get("/services", {
      params: {
        "where[status][equals]": "published",
      },
    });
    return response.data.docs;
  } catch (error: any) {
    console.error(
      `Error fetching services:`,
      error.response?.data || error.message
    );
    return null;
  }
}
export async function getAllServices() {
  try {
    const response = await axiosInstance.get("/services", {
      params: {
        "where[status][in]": ["published", "draft"],
      },
    });
    return response.data.docs;
  } catch (error: any) {
    console.error(
      `Error fetching services:`,
      error.response?.data || error.message
    );
    return null;
  }
}
export async function getServicesBySlug(slug: string) {
  try {
    const response = await axiosInstance.get(`/services`, {
      params: {
        "where[slug][equals]": slug,
      },
    });
    return response.data.docs[0];
  } catch (error: any) {
    console.error(
      `Error fetching services by slug:`,
      error.response?.data || error.message
    );
    return null;
  }
}
