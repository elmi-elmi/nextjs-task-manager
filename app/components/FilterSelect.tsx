'use client';

import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setFilter, selectFilter } from '@/store/tasksSlice';
import labels from '@/constants/labels';
import { TaskFilter } from '@/types/task';

export default function FilterSelect() {
  const dispatch = useAppDispatch();
  const filter = useAppSelector(selectFilter);

  const handleChange = (event: SelectChangeEvent<TaskFilter>) => {
    dispatch(setFilter(event.target.value as TaskFilter));
  };

  return (
    <FormControl
      variant="outlined"
      size="small"
      sx={{
        minWidth: 180,
        backgroundColor: 'white',
        borderRadius: 2,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <InputLabel id="filter-label">{labels.filterLabel}</InputLabel>
      <Select
        labelId="filter-label"
        value={filter}
        onChange={handleChange}
        label={labels.filterLabel}
      >
        <MenuItem value="all">{labels.filterAll}</MenuItem>
        <MenuItem value="completed">{labels.filterCompleted}</MenuItem>
        <MenuItem value="incomplete">{labels.filterIncomplete}</MenuItem>
      </Select>
    </FormControl>
  );
}
