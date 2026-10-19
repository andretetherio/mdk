# `DatePicker` & `DateRangePicker`

Single-date and range-date pickers built on `react-day-picker`. The range
picker includes presets and a modal-style popover with Clear / Apply actions.

<!-- BEGIN GENERATED: props — do not edit; npm run generate:usage-proptables (source: component JSDoc/types via registry.json) -->
## Props

### `DatePicker` props

| Prop | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `calendarClassName` | Optional | `string` | - | Custom className for the calendar |
| `dateFormat` | Optional | `string` | `"MM/dd/yyyy"` | Date format for display |
| `disabled` | Optional | `(boolean & (Matcher \| Matcher[]))` | `false` | Whether the picker is disabled |
| `onSelect` | Optional | `((date: Date \| undefined) => void)` | - | Callback when date changes |
| `placeholder` | Optional | `string` | `"Pick a date"` | Placeholder text when no date is selected |
| `selected` | Optional | `Date` | - | Currently selected date |
| `triggerClassName` | Optional | `string` | - | Custom className for the trigger button |

### `DateRangePicker` props

| Prop | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `allowFutureDates` | Optional | `boolean` | `false` | Whether to allow future dates |
| `calendarClassName` | Optional | `string` | - | Custom className for the calendar |
| `dateFormat` | Optional | `string` | `"MM/dd/yyyy"` | Date format for display |
| `disabled` | Optional | `(boolean & (Matcher \| Matcher[]))` | `false` | Whether the picker is disabled |
| `modalClassName` | Optional | `string` | - | Custom className for the modal |
| `onSelect` | Optional | `((range: DateRange \| undefined) => void)` | - | Callback when date range changes |
| `placeholder` | Optional | `string` | `"Pick a date range"` | Placeholder text when no range is selected |
| `presets` | Optional | `PresetItem[]` | - | Custom preset items |
| `selected` | Optional | `DateRange` | - | Selected date range |
| `showPresets` | Optional | `boolean` | `true` | Whether to show preset buttons |
| `triggerClassName` | Optional | `string` | - | Custom className for the trigger button |

### `DateRange`

| Field | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `from` | Required | `Date` | - | Range start; `undefined` means nothing is selected and the placeholder shows |
| `to` | Optional | `Date` | - | Range end; while unset the trigger shows `from` alone and Apply stays disabled |

### `PresetItem`

| Field | Status | Type / Options | Default | Description |
|------|--------|----------------|---------|-------------|
| `label` | Required | `string` | - | Preset button text; also used as the React key, so keep it unique |
| `value` | Required | `DateRange` | - | Range applied to the draft on click; needs both `from` and `to`. Highlighted when the draft is within 5 minutes of it at both ends |
<!-- END GENERATED: props -->

## Example

```tsx
<DatePicker selected={date} onSelect={setDate} />
<DateRangePicker selected={range} onSelect={setRange} showPresets />
```

## Data contracts

```ts
type DateRange = { from: Date | undefined; to?: Date | undefined };
type PresetItem = { label: string; value: DateRange };
```
