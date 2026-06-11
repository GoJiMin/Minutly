import {NotebookPen, X} from 'lucide-react';
import {Button, Separator} from '@/shared/components';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/shared/components/drawer';
import {MeetingMemoPanelBoundary} from './MeetingMemoPanelBoundary';

type Props = {
  meetingId: string;
};

export function MeetingMemoDrawer({meetingId}: Props) {
  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button size="icon" variant="outline" className="rounded-full p-7">
          <NotebookPen className="size-7" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="data-[vaul-drawer-direction=right]:w-[90vw] p-0 before:inset-0 before:rounded-none">
        <DrawerHeader className="flex-row justify-between">
          <div>
            <DrawerTitle>메모</DrawerTitle>
            <DrawerDescription>이 회의에만 저장되는 내용이에요.</DrawerDescription>
          </div>
          <DrawerClose asChild>
            <X className="size-5" />
          </DrawerClose>
        </DrawerHeader>
        <Separator />
        <MeetingMemoPanelBoundary
          meetingId={meetingId}
          showHeader={false}
          className="rounded-none border-0 pt-0 bg-muted/30"
        />
      </DrawerContent>
    </Drawer>
  );
}
