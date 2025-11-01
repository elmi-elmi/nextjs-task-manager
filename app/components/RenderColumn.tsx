import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import Item from '@/app/components/Item';
import { Box, Paper } from '@mui/material';
import { ColumnKey, Task } from '@/types/task';
import DroppableColumn from '@/app/components/DroppableColumn';

const RenderColumn = ({
  title,
  list,
  id,
}: {
  title: string;
  list: Task[];
  id: ColumnKey;
}) => (
  <DroppableColumn id={id} title={title}>
    <SortableContext
      items={list.map((t) => t.id)}
      strategy={verticalListSortingStrategy}
    >
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {list.length === 0 ? (
          <Paper
            sx={{
              p: 2,
              border: '2px dashed #aaa',
              borderRadius: 2,
              color: 'text.secondary',
              backgroundColor: '#fafafa',
              textAlign: 'center',
            }}
            aria-label={`Empty ${title} column, drop tasks here`}
          >
            Drop here
          </Paper>
        ) : (
          list.map((task) => <Item key={task.id} task={task} />)
        )}
      </Box>
    </SortableContext>
  </DroppableColumn>
);

export default RenderColumn;
