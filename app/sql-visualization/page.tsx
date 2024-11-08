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
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Edge, Node } from "../../lib/elk";

const formSchema = z.object({
  language: z.string(),
  sqlQuery: z.string(),
});

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
    // call /chat api to get response

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

    console.log(data); // response from /chat api
    const visualizationData = convertResponseToVisualizationData(data);
    setVisualizationData(visualizationData);

    // setIsLoading(true);
    // try {
    //   const data = await getVisualizationData(values.sqlQuery, values.language);
    //   setVisualizationData(data);
    // } catch (error) {
    //   console.error("Error generating visualization:", error);
    // } finally {
    //   setIsLoading(false);
    // }
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
                        <SelectItem value="postgresql">PostgreSQL</SelectItem>
                        <SelectItem value="mysql">MySQL</SelectItem>
                        <SelectItem value="sqlite">SQLite</SelectItem>
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

// sample response
// [
//   {
//       "name": "order_id",
//       "value": [
//           "orders.order_id"
//       ]
//   },
//   {
//       "name": "order_date",
//       "value": [
//           "orders.order_date"
//       ]
//   },
//   {
//       "name": "quantity",
//       "value": [
//           "orders.quantity"
//       ]
//   },
//   {
//       "name": "total_price",
//       "value": [
//           "orders.total_price"
//       ]
//   },
//   {
//       "name": "product_id",
//       "value": [
//           "products.product_id"
//       ]
//   },
//   {
//       "name": "product_name",
//       "value": [
//           "products.product_name"
//       ]
//   },
//   {
//       "name": "product_price",
//       "value": [
//           "products.price",
//           "shipments.tax"
//       ],
//       "detail": "products.price + shipments.tax AS product_price"
//   },
//   {
//       "name": "shipment_id",
//       "value": [
//           "shipments.shipment_id"
//       ]
//   },
//   {
//       "name": "shipment_date",
//       "value": [
//           "shipments.shipment_date"
//       ]
//   },
//   {
//       "name": "shipment_status",
//       "value": [
//           "shipments.status"
//       ],
//       "detail": "shipments.status AS shipment_status"
//   }
// ]

type IResponse = {
  result: {
    name: string;
    value: string[];
    detail?: string;
  }[];
  tables: {
    name: string;
    columns: string[];
  }[];
};

function convertResponseToVisualizationData(response: IResponse): {
  nodes: Node[];
  edges: Edge[];
} {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Create nodes for each table
  response.tables.forEach((table) => {
    nodes.push({
      id: table.name,
      data: { label: table.name },
      type: "table",
      // add columns as children
      children: table.columns.map((column) => ({
        id: `${table.name}.${column}`,
        type: "column",
        data: { label: column },
      })),
    });
  });

  // add table result as nodes
  nodes.push({
    id: "result",
    data: { label: "result" },
    type: "result",
    children: response.result.map((item) => ({
      id: `result.${item.name}`,
      data: { label: item.name },
      detail: item.detail,
      type: "column",
    })),
  });

  // Create nodes and edges for computed columns/relationships
  response.result.forEach((item) => {
    item.value.forEach((column) => {
      edges.push({
        id: `${column}-result.${item.name}`,
        source: column,
        target: `result.${item.name}`,
      });
    });
  });

  console.log({ nodes, edges });

  return { nodes, edges };
}
