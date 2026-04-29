import Trending from "../Home/Trending";
import Recent from '../Home/Recent';
import RecentSeries from '../Home/RecentSeries';
 
export default function Home() {
  return (
    <div className="bg-black min-h-screen">
      <Trending />

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 flex flex-col gap-10">
        <Recent />
        <RecentSeries />
      </div>
    </div>
  );
}
