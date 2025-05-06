// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { getAllIdeas, updateIdea } from "@/lib/ideas.ts";
import { Link, useNavigate } from "react-router-dom";
import { IDEA_EVENTS, PAGE_VIEWED, PAGES, captureEvent } from "@/lib/posthog";

export default function Ideas() {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState<any[]>([]);
  const [editingUrl, setEditingUrl] = useState<{ id: string, url: string } | null>(null);

  useEffect(() => {
    // Track page view
    captureEvent(PAGE_VIEWED, {
      page: PAGES.IDEAS_LIST
    });

    getAllIdeas().then(setIdeas).catch(console.error);
  }, []);

  if (!ideas) {
    return <div>Loading...</div>;
  }

  const handleToggleChosen = async (ideaId: string, current: Date | null) => {
    const purchasedAt = current ? null : new Date();

    const updated = await updateIdea(ideaId, {
      purchased_at: purchasedAt,
    });

    // Track purchased status toggle
    captureEvent(IDEA_EVENTS.IDEA_STATUS_TOGGLED, {
      idea_id: ideaId,
      idea_name: ideas.find(i => i.id === ideaId)?.name,
      new_status: purchasedAt ? "purchased" : "not_purchased",
      source: "ideas_page"
    });

    setIdeas(ideas.map((i) => (i.id === ideaId ? updated : i)));
  };

  const handleViewRecipient = (id: string) => {
    navigate(`/giftee/${id}`); // Replace with the appropriate recipient page route
  };

  const handleSaveUrl = async (ideaId: string, url: string) => {
    const updated = await updateIdea(ideaId, { url });
    setIdeas(ideas.map((i) => (i.id === ideaId ? updated : i)));
    setEditingUrl(null);
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "giftee",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="pl-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Person
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="pl-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Gift
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "url",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="pl-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            URL
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const idea = row.original;

        if (editingUrl && editingUrl.id === idea.id) {
          return (
            <div className="flex items-center space-x-2">
              <Input
                value={editingUrl.url}
                onChange={(e) => setEditingUrl({ ...editingUrl, url: e.target.value })}
                className="w-40"
                data-testid="url-input"
              />
              <Button
                size="sm"
                onClick={() => handleSaveUrl(idea.id, editingUrl.url)}
                data-testid="save-url-btn"
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingUrl(null)}
                data-testid="cancel-url-btn"
              >
                Cancel
              </Button>
            </div>
          );
        }

        return (
          <div className="flex items-center space-x-2">
            {idea.url ? (
              <a
                href={idea.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline truncate max-w-[200px]"
                data-testid="idea-url"
              >
                {idea.url}
              </a>
            ) : (
              <span className="text-gray-400">No URL</span>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditingUrl({ id: idea.id, url: idea.url || "" })}
              data-testid="edit-url-btn"
            >
              Edit
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "purchased",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="pl-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Bought?
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        console.log(row.original);
        const ogRow = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => handleToggleChosen(ogRow.id, ogRow.purchased_at)}
              >
                {ogRow.purchased_at ? "Not bought" : "Bought"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleViewRecipient(ogRow.giftee_id)}
              >
                View person
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setEditingUrl({ id: ogRow.id, url: ogRow.url || "" })}
              >
                Edit URL
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <div className="my-4">
        <Link to="/dashboard" className="text-sm text-primary underline">
          ← Home
        </Link>
      </div>
      <div>
        <DataTable columns={columns} data={getData(ideas)} />
      </div>
    </>
  );
}

// takes a list of items, returns an array in the right form for our columns
function getData(items: any[]) {
  return items.map((item) => {
    return {
      id: item.id,
      name: item.name,
      giftee: item.giftees?.name,
      giftee_id: item.giftees?.id,
      url: item.url,
      purchased:
        item.purchased_at == null
          ? "−"
          : item.purchased_for === ""
            ? "✓"
            : item.purchased_for,
      purchased_at: item.purchased_at,
    };
  });
}

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import { MoreHorizontal } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";

export function DataTable({ columns, data }: { columns: ColumnDef<any>[]; data: any[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter recipients..."
          value={(table.getColumn("giftee")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("giftee")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
