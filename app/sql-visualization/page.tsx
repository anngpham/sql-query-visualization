"use client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Visualization from "@/components/Visualization";
import { convertResponseToVisualizationData } from "@/lib/visualization-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Edge, Node } from "../../lib/elk";

const formSchema = z.object({
  language: z.string(),
  sqlQuery: z.string(),
});

const languages = [
  "athena",
  "azuresql",
  "bigquery",
  "couchbase",
  "databricks",
  "db2",
  "gaussdb",
  "greenplum",
  "hana",
  "hive",
  "impala",
  "informix",
  "mdx",
  "mssql",
  "mysql",
  "netezza",
  "openedge",
  "oracle",
  "postgresql",
  "presto",
  "redshift",
  "snowflake",
  "sparksql",
  "sybase",
  "teradata",
  "vertica",
];

export default function Page() {
  const [visualizationData, setVisualizationData] = useState<{
    nodes: Node[];
    edges: Edge[];
  }>({ nodes: [], edges: [] });
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      language: "postgresql",
      sqlQuery: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to generate visualization");
      }

      const data = await response.json();
      console.log(data);
      const visualizationData = convertResponseToVisualizationData(data);
      setVisualizationData(visualizationData);
    } catch (error) {
      console.error("Error generating visualization:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/3 flex flex-col h-full">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col h-full p-5"
          >
            <div className="flex items-center gap-4 mb-4">
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((language) => (
                          <SelectItem key={language} value={language}>
                            {language}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Generating..." : "Generate Visualization"}
              </Button>
            </div>

            <div className="flex-1">
              <FormField
                control={form.control}
                name="sqlQuery"
                render={({ field }) => (
                  <FormItem className="h-full">
                    <FormControl>
                      <Textarea
                        placeholder="Enter your SQL query here..."
                        className="h-full font-mono resize-none"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </div>
      <div className="flex-1 border-l border-gray-200">
        <Visualization data={visualizationData} />
      </div>
    </div>
  );
}
