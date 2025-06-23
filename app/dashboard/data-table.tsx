import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Card {
  id: string
  english: string
  spanish: string
  proficiency: number
  next_review: string | null
}

interface DataTableProps {
  cards: Card[]
}

export function DataTable({ cards }: DataTableProps) {
  return (
    <div className="rounded-md border mx-4 lg:mx-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>English</TableHead>
            <TableHead>Spanish</TableHead>
            <TableHead>Proficiency</TableHead>
            <TableHead>Next Review</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cards.map((card) => (
            <TableRow key={card.id}>
              <TableCell>{card.english}</TableCell>
              <TableCell>{card.spanish}</TableCell>
              <TableCell>{card.proficiency}</TableCell>
              <TableCell>
                {card.next_review
                  ? new Date(card.next_review).toLocaleString("en-US", {
                      timeZone: "America/New_York",
                    })
                  : ""}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 