# Carbonara Intern Assignment

## Known bugs

### Customers added simultaneously have ambiguous ordering.

The sqlite3 backend uses the `createdAt` attribute to sort customers by insertion order. If several customers are added simultaneously (within the same milisecond), they have the same `createdAt` time and may be ordered incorrectly.

The native backend does not suffer from this problem.