import { useDroppable } from '@dnd-kit/core';
import { Paper, Typography } from '@mui/material';
import { ColumnKey } from '@/types/task';

const DroppableColumn = ({
  id,
  title,
  children,
}: {
  id: ColumnKey;
  title: string;
  children: React.ReactNode;
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <Paper
      ref={setNodeRef}
      elevation={3}
      sx={{
        flex: 1,
        p: 2,
        borderRadius: 3,
        minHeight: 300,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: isOver ? '#eefaff' : '#fafafa',
        transition: 'background-color 0.2s ease',
      }}
    >
      <Typography variant="h6" component="h3" gutterBottom>
        {title}
      </Typography>
      {children}
    </Paper>
  );
};

export default DroppableColumn;
