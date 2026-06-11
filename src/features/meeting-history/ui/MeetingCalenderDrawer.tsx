import {Calendar, X} from 'lucide-react';
import {Button} from '@/shared/components';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/shared/components/drawer';

export function MeetingCalenderDrawer() {
  return (
    <Drawer direction="left">
      <DrawerTrigger asChild>
        <Button size="icon" variant="outline" className="rounded-full p-7">
          <Calendar className="size-7" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="data-[vaul-drawer-direction=left]:w-[90vw] p-0 before:inset-0 before:rounded-none">
        <DrawerHeader className="flex-row justify-between">
          <div>
            <DrawerTitle>캘린더</DrawerTitle>
            <DrawerDescription>먼저 날짜를 선택하면 회의를 조회할 수 있어요.</DrawerDescription>
          </div>
          <DrawerClose asChild>
            <X className="size-5" />
          </DrawerClose>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
}
