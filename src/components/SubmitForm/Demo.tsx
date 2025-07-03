"use client";

import { useState } from "react";
import { Formik, Form as FormikForm, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useParams } from "next/navigation";

type Step = {
  name: string;
  title: string;
  type: "input" | "radio" | "composite";
  options?: string[];
  validation?: Yup.StringSchema<string>;
  fields?: {
    name: string;
    placeholder: string;
    validation: Yup.StringSchema<string>;
  }[];
};

type ServiceConfig = {
  [key: string]: {
    steps: Step[];
  };
};

const COMMON_STEPS: Step[] = [
  {
    name: "userDetails",
    title: "Tell us about yourself",
    type: "composite", // type for combine  steps
    fields: [
      {
        name: "name",
        placeholder: "Full Name",
        validation: Yup.string().required("Full name is required"),
      },
      {
        name: "email",
        placeholder: "Email Address",
        validation: Yup.string()
          .email("Invalid email address")
          .required("Email is required"),
      },
    ],
  },
  {
    name: "phone",
    title: "What is your contact number?",
    type: "input",
    validation: Yup.string()
      .matches(/^[0-9]{10,15}$/, "Phone number is invalid")
      .required("Phone number is required"),
  },
];

const SERVICES: ServiceConfig = {
  "walk-in-shower": {
    steps: [
      {
        name: "homeowner",
        title: "Are you the homeowner?",
        type: "radio",
        options: ["Yes", "No"],
        validation: Yup.string().required("You must select an option"),
      },
    ],
  },
  "window-replacement": {
    steps: [
      {
        name: "mobileHome",
        title: "Is it a mobile, modular, or manufactured home?",
        type: "radio",
        options: ["Yes", "No"],
        validation: Yup.string().required("You must select an option"),
      },
    ],
  },
};

const DynamicForm = () => {
  const params = useParams();
  const { toast } = useToast();
  // console.log(params);
  const serviceSlug = params.slug as keyof ServiceConfig; // Ensure serviceSlug is of type keyof ServiceConfig
  const selectedService = SERVICES[serviceSlug];
  if (!selectedService) {
    return <div>Invalid service selected.</div>;
  }

  const formSteps = [...selectedService.steps, ...COMMON_STEPS]; // Combine service-specific and common steps
  const totalSteps = formSteps.length;

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

  const initialValues = formSteps.reduce((values, step) => {
    values[step.name] = ""; // Set initial value for each field to an empty string
    return values;
  }, {} as Record<string, string>);

  const handleNext = (values: any) => {
    if (currentStep === totalSteps - 1) {
      handleSubmit(values);
    } else {
      setCurrentStep((prev) => prev + 1);
      setProgress(((currentStep + 1) / totalSteps) * 100);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      // Example: Send data to an API
      // console.log("Form submitted:", values);

      toast({
        title: "Success!",
        description: "Your request has been submitted successfully.",
      });
    } catch (error) {
      console.error("Error submitting data:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100 top-0  fixed w-full z-[99]">
      <Formik
        initialValues={initialValues}
        validationSchema={formSteps[currentStep].validation}
        onSubmit={(values) => {
          handleNext(values);
        }}
      >
        {({ values, isValid, setFieldValue }) => (
          <FormikForm className="w-full lg:w-1/2 p-6 bg-white rounded-lg shadow-md relative overflow-hidden">
            {/* Progress Bar */}
            <div
              className="absolute bottom-0 left-0 h-[5px] bg-gray-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />

            {/* Form Heading */}
            <h2 className="text-2xl font-semibold text-center mb-6">
              {formSteps[currentStep].title}
            </h2>

            {/* Form Step Content */}
            <div className="text-center">
              {formSteps[currentStep].type === "radio" && (
                <RadioGroup
                  className="flex flex-col items-center space-y-2"
                  value={values[formSteps[currentStep].name]}
                  onValueChange={(value) =>
                    setFieldValue(formSteps[currentStep].name, value)
                  }
                >
                  {formSteps[currentStep].options?.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={option}
                        id={option}
                        className="h-6 w-6 border-2 border-[#28a745] rounded-full focus:ring-2 focus:ring-green-400"
                      />
                      <label htmlFor={option} className="text-sm font-medium">
                        {option}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {formSteps[currentStep].type === "input" && (
                <Field
                  name={formSteps[currentStep].name}
                  as={Input}
                  placeholder={formSteps[currentStep].title}
                  className="mb-4"
                />
              )}
              <ErrorMessage
                name={formSteps[currentStep].name}
                component="div"
                className="text-red-500 text-sm mb-2"
              />
            </div>
            {formSteps[currentStep].type === "composite" && (
              <div className="space-y-4">
                {formSteps[currentStep].fields?.map((field) => (
                  <div key={field.name}>
                    <Field
                      name={field.name}
                      as={Input}
                      placeholder={field.placeholder}
                      className="mb-4"
                    />
                    <ErrorMessage
                      name={field.name}
                      component="div"
                      className="text-red-500 text-sm mb-2"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-4 flex justify-center gap-4">
              {currentStep > 0 && (
                <Button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="bg-gray-300 text-black hover:bg-gray-400"
                >
                  Back
                </Button>
              )}
              <Button
                type="submit"
                className={`bg-[#28a745] text-white hover:bg-[#28a745] ${
                  !isValid && "disabled:bg-green-300"
                }`}
                disabled={!isValid}
              >
                {currentStep === totalSteps - 1 ? "Submit" : "Next"}
              </Button>
            </div>
          </FormikForm>
        )}
      </Formik>
    </div>
  );
};

export default DynamicForm;
