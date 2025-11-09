import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bug, TestTube, ListTodo, User, ArrowRight, GitBranch, Clock, Grid2X2Check, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Navbar from "@/components/navbar";
import { Nav } from "react-day-picker";


/**
 * Color palette: bg: #F5E8C7  surface: #DEBA9D  surface-2: #C59B80  primary: #A86F5C  ink: #5A3A32
 */

export default function DashboardPage() {
  return (
    <Navbar />
    // <div className="min-h-screen w-full" style={{ background: "#F5E8C7" }}>
    //   <Navbar />

    //   {/* MAIN DASHBOARD */}
    //   <div className="mx-auto max-w-[1600px] px-6 py-8">
    //     {/* STATS OVERVIEW */}
    //     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    //       {/* Total Open Issues */}
    //       <Card className="border shadow-sm" style={{ borderColor: "#C59B80", background: "#FFFFFF" }}>
    //         <CardHeader className="pb-3">
    //           <div className="flex items-center justify-between">
    //             <CardTitle className="text-sm font-medium" style={{ color: "#5A3A32", opacity: 0.7 }}>Issues</CardTitle>
    //             <Bug className="h-4 w-4" style={{ color: "#A86F5C" }} />
    //           </div>
    //         </CardHeader>
    //         <CardContent>
    //           <div className="flex items-baseline gap-2 mb-3">
    //             <span className="text-3xl font-bold" style={{ color: "#5A3A32" }}>24</span>
    //             <span className="text-sm" style={{ color: "#5A3A32", opacity: 0.6 }}>total open</span>
    //           </div>
    //           <div className="flex items-center justify-between">
    //             <div>
    //               <span className="text-lg font-semibold" style={{ color: "#A86F5C" }}>5</span>
    //               <span className="text-xs ml-1" style={{ color: "#5A3A32", opacity: 0.6 }}>pending for you</span>
    //             </div>
    //           </div>
    //           <a href="#" className="inline-flex items-center gap-1 mt-3 text-xs font-medium hover:underline" style={{ color: "#A86F5C" }}>
    //             Go to your pending issues <ArrowRight className="h-3 w-3" />
    //           </a>
    //         </CardContent>
    //       </Card>

    //       {/* Total Scenarios */}
    //       <Card className="border shadow-sm" style={{ borderColor: "#C59B80", background: "#FFFFFF" }}>
    //         <CardHeader className="pb-3">
    //           <div className="flex items-center justify-between">
    //             <CardTitle className="text-sm font-medium" style={{ color: "#5A3A32", opacity: 0.7 }}>Scenario Testing</CardTitle>
    //             <TestTube className="h-4 w-4" style={{ color: "#A86F5C" }} />
    //           </div>
    //         </CardHeader>
    //         <CardContent>
    //           <div className="flex items-baseline gap-2 mb-3">
    //             <span className="text-3xl font-bold" style={{ color: "#5A3A32" }}>8</span>
    //             <span className="text-sm" style={{ color: "#5A3A32", opacity: 0.6 }}>total open</span>
    //           </div>
    //           <div className="flex items-center justify-between">
    //             <div>
    //               <span className="text-lg font-semibold" style={{ color: "#A86F5C" }}>2</span>
    //               <span className="text-xs ml-1" style={{ color: "#5A3A32", opacity: 0.6 }}>pending for you</span>
    //             </div>
    //           </div>
    //           <a href="#" className="inline-flex items-center gap-1 mt-3 text-xs font-medium hover:underline" style={{ color: "#A86F5C" }}>
    //             Go to your pending tests <ArrowRight className="h-3 w-3" />
    //           </a>
    //         </CardContent>
    //       </Card>

    //       {/* Team Activity */}
    //       <Card className="border shadow-sm" style={{ borderColor: "#C59B80", background: "#FFFFFF" }}>
    //         <CardHeader className="pb-3">
    //           <div className="flex items-center justify-between">
    //             <CardTitle className="text-sm font-medium" style={{ color: "#5A3A32", opacity: 0.7 }}>Team Status</CardTitle>
    //             <Clock className="h-4 w-4" style={{ color: "#A86F5C" }} />
    //           </div>
    //         </CardHeader>
    //         <CardContent>
    //           <div className="flex items-baseline gap-2 mb-3">
    //             <span className="text-3xl font-bold" style={{ color: "#5A3A32" }}>8</span>
    //             <span className="text-sm" style={{ color: "#5A3A32", opacity: 0.6 }}>/ 10 active</span>
    //           </div>
    //           <div className="space-y-1">
    //             <div className="flex items-center gap-2">
    //               <div className="w-2 h-2 rounded-full" style={{ background: "#22c55e" }}></div>
    //               <span className="text-xs" style={{ color: "#5A3A32", opacity: 0.7 }}>12 issues in progress</span>
    //             </div>
    //             <div className="flex items-center gap-2">
    //               <div className="w-2 h-2 rounded-full" style={{ background: "#A86F5C" }}></div>
    //               <span className="text-xs" style={{ color: "#5A3A32", opacity: 0.7 }}>3 tests running</span>
    //             </div>
    //           </div>
    //         </CardContent>
    //       </Card>

    //       {/* This Week Summary */}
    //       <Card className="border shadow-sm" style={{ borderColor: "#C59B80", background: "#FFFFFF" }}>
    //         <CardHeader className="pb-3">
    //           <div className="flex items-center justify-between">
    //             <CardTitle className="text-sm font-medium" style={{ color: "#5A3A32", opacity: 0.7 }}>This Week</CardTitle>
    //             <CheckCircle2 className="h-4 w-4" style={{ color: "#A86F5C" }} />
    //           </div>
    //         </CardHeader>
    //         <CardContent>
    //           <div className="space-y-2">
    //             <div className="flex items-center justify-between">
    //               <span className="text-xs" style={{ color: "#5A3A32", opacity: 0.7 }}>Issues closed</span>
    //               <span className="text-lg font-bold" style={{ color: "#5A3A32" }}>18</span>
    //             </div>
    //             <div className="flex items-center justify-between">
    //               <span className="text-xs" style={{ color: "#5A3A32", opacity: 0.7 }}>Tests completed</span>
    //               <span className="text-lg font-bold" style={{ color: "#5A3A32" }}>5</span>
    //             </div>
    //             <div className="flex items-center justify-between">
    //               <span className="text-xs" style={{ color: "#5A3A32", opacity: 0.7 }}>Commits</span>
    //               <span className="text-lg font-bold" style={{ color: "#5A3A32" }}>47</span>
    //             </div>
    //           </div>
    //         </CardContent>
    //       </Card>
    //     </div>

    //     {/* TWO COLUMN LAYOUT */}
    //     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    //       {/* RECENT ACTIVITY */}
    //       <Card className="border shadow-sm" style={{ borderColor: "#C59B80", background: "#FFFFFF" }}>
    //         <CardHeader className="pb-3">
    //           <CardTitle className="text-base font-semibold" style={{ color: "#5A3A32" }}>Recent Activity</CardTitle>
    //         </CardHeader>
    //         <CardContent className="p-0">
    //           <Table>
    //             <TableHeader>
    //               <TableRow style={{ borderColor: "#F5E8C7" }}>
    //                 <TableHead className="text-xs" style={{ color: "#5A3A32", opacity: 0.7 }}>User</TableHead>
    //                 <TableHead className="text-xs" style={{ color: "#5A3A32", opacity: 0.7 }}>Action</TableHead>
    //                 <TableHead className="text-xs text-right" style={{ color: "#5A3A32", opacity: 0.7 }}>Time</TableHead>
    //               </TableRow>
    //             </TableHeader>
    //             <TableBody>
    //               {[
    //                 { user: 'Sarah K', avatar: 'SK', action: 'resolved #ISS-142', time: '5m ago', type: 'resolved' },
    //                 { user: 'Mike R', avatar: 'MR', action: 'commented on #ISS-141', time: '12m ago', type: 'comment' },
    //                 { user: 'Alex P', avatar: 'AP', action: 'created #ISS-140', time: '1h ago', type: 'created' },
    //                 { user: 'Tom H', avatar: 'TH', action: 'completed Tutorial Test', time: '2h ago', type: 'completed' },
    //                 { user: 'Sarah K', avatar: 'SK', action: 'assigned #ISS-139 to Mike R', time: '3h ago', type: 'assigned' },
    //               ].map((activity, idx) => (
    //                 <TableRow key={idx} style={{ borderColor: "#F5E8C7" }} className="hover:bg-[#F8F1E3]">
    //                   <TableCell className="py-3">
    //                     <div className="flex items-center gap-2">
    //                       <Avatar className="h-6 w-6">
    //                         <AvatarFallback style={{ background: "#C59B80", color: "#fff" }} className="text-xs">{activity.avatar}</AvatarFallback>
    //                       </Avatar>
    //                       <span className="text-sm font-medium" style={{ color: "#5A3A32" }}>{activity.user}</span>
    //                     </div>
    //                   </TableCell>
    //                   <TableCell className="py-3">
    //                     <span className="text-sm" style={{ color: "#5A3A32", opacity: 0.8 }}>{activity.action}</span>
    //                   </TableCell>
    //                   <TableCell className="py-3 text-right">
    //                     <span className="text-xs" style={{ color: "#5A3A32", opacity: 0.6 }}>{activity.time}</span>
    //                   </TableCell>
    //                 </TableRow>
    //               ))}
    //             </TableBody>
    //           </Table>
    //         </CardContent>
    //       </Card>

    //       {/* RECENT COMMITS */}
    //       <Card className="border shadow-sm" style={{ borderColor: "#C59B80", background: "#FFFFFF" }}>
    //         <CardHeader className="pb-3">
    //           <CardTitle className="text-base font-semibold flex items-center gap-2" style={{ color: "#5A3A32" }}>
    //             <GitBranch className="h-4 w-4" />
    //             Recent Commits
    //           </CardTitle>
    //         </CardHeader>
    //         <CardContent className="p-0">
    //           <Table>
    //             <TableHeader>
    //               <TableRow style={{ borderColor: "#F5E8C7" }}>
    //                 <TableHead className="text-xs" style={{ color: "#5A3A32", opacity: 0.7 }}>User</TableHead>
    //                 <TableHead className="text-xs" style={{ color: "#5A3A32", opacity: 0.7 }}>Branch</TableHead>
    //                 <TableHead className="text-xs text-right" style={{ color: "#5A3A32", opacity: 0.7 }}>Time</TableHead>
    //               </TableRow>
    //             </TableHeader>
    //             <TableBody>
    //               {[
    //                 { user: 'Alex P', avatar: 'AP', branch: 'feature/inventory-fix', commit: '65346', time: '10m ago' },
    //                 { user: 'Sarah K', avatar: 'SK', branch: 'bugfix/collision', commit: '65345', time: '25m ago' },
    //                 { user: 'Mike R', avatar: 'MR', branch: 'feature/dialogue-ui', commit: '65344', time: '1h ago' },
    //                 { user: 'Tom H', avatar: 'TH', branch: 'feature/audio-system', commit: '65343', time: '2h ago' },
    //                 { user: 'Alex P', avatar: 'AP', branch: 'main', commit: '65342', time: '3h ago' },
    //               ].map((commit, idx) => (
    //                 <TableRow key={idx} style={{ borderColor: "#F5E8C7" }} className="hover:bg-[#F8F1E3]">
    //                   <TableCell className="py-3">
    //                     <div className="flex items-center gap-2">
    //                       <Avatar className="h-6 w-6">
    //                         <AvatarFallback style={{ background: "#C59B80", color: "#fff" }} className="text-xs">{commit.avatar}</AvatarFallback>
    //                       </Avatar>
    //                       <span className="text-sm font-medium" style={{ color: "#5A3A32" }}>{commit.user}</span>
    //                     </div>
    //                   </TableCell>
    //                   <TableCell className="py-3">
    //                     <div className="flex flex-col">
    //                       <span className="text-xs font-mono" style={{ color: "#A86F5C" }}>{commit.branch}</span>
    //                       <span className="text-xs" style={{ color: "#5A3A32", opacity: 0.6 }}>#{commit.commit}</span>
    //                     </div>
    //                   </TableCell>
    //                   <TableCell className="py-3 text-right">
    //                     <span className="text-xs" style={{ color: "#5A3A32", opacity: 0.6 }}>{commit.time}</span>
    //                   </TableCell>
    //                 </TableRow>
    //               ))}
    //             </TableBody>
    //           </Table>
    //         </CardContent>
    //       </Card>
    //     </div>
    //   </div>
    // </div>
  );
}