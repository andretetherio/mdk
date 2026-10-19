# Card

Layout card with optional `Card.Header`, `Card.Body`, and `Card.Footer` slots.
Default children go to body. Forwards all native `<div>` attributes; pass
`onClick` to make the whole card clickable.

## Slots

```tsx
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>
```

## Props detail

> **Props and the object shapes they reference are generated from this component's TypeScript types, the source of truth.** The following is supplementary (sub-component props, allowed values, `ref` methods, or passthrough props), not the full prop list.

`CardProps`, `CardHeaderProps`, `CardBodyProps`, `CardFooterProps` are all
`HTMLAttributes<HTMLDivElement>`.

## Example

```tsx
<Card onClick={() => navigate("/details")}>
  <Card.Header>Title</Card.Header>
  Content (default children go to body)
</Card>
```
