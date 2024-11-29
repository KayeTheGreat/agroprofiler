import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { PageProps } from "@/types";
import Card from "@/Components/Card";
import { useEffect, useState } from "react";

import PieChart from "@/Components/PieChart";
import DonutChart from "@/Components/DonutChart";

import Heatmap from "@/Components/Heatmap";

import Dropdown from "@/Components/Dropdown";

import { ChevronDown } from "lucide-react";

import axios from "axios";

import GroupedBarChart from "@/Components/GroupedBarChart";
import CommodityDonutChart from "@/Components/CommodityDonutChart";
import BoxPlot from "@/Components/BoxPlot";

interface Commodity {
    id: number;
    name: string;
    farms_count: number;
    count: number;
}

interface DataPoint {
    barangay: string;
    value: number;
}

interface LineData {
    name: string;
    color: string;
    data: DataPoint[];
}

type HeatmapData = {
    [barangay: string]: {
        allocations?: { [subtype: string]: number };
        commodities?: { [subtype: string]: number };
        farmers?: { [subtype: string]: number };
        highValue?: { [subtype: string]: number };
    };
};

interface BarangayData {
    [key: string]: {
        registeredFarmers: number;
        unregisteredFarmers: number;
        commodityCounts: {
            [commodityType: string]: number;
        };
        allocationCounts: {
            [allocationType: string]: number;
        };
    };
}

interface CommodityCategory {
    id: number;
    name: string;
    desc: string;
    commodities: Array<{ name: string; count: number }>;
}

interface DashboardProps extends PageProps {
    totalAllocations: number;
    commoditiesDistribution: Array<{
        id: number;
        name: string;
        farms_count: number;
    }>;
    farms: {
        latitude: number;
        longitude: number;
        barangay: string;
    };
    registeredFarmers: number;
    unregisteredFarmers: number;
    totalFarmers: number;
    commodityCounts: {
        rice: number;
        corn: number;
        fish: number;
    };
    highValueCounts: {
        high_value: number;
        vegetable: number;
        fruit_bearing: number;
    };
    barangayData: BarangayData;
    heatmapData: HeatmapData;
    commodityCategories: CommodityCategory[];
}

export default function Dashboard({
    auth,
    children,
    totalAllocations,
    commoditiesDistribution,
    registeredFarmers,
    unregisteredFarmers,
    totalFarmers,
    commodityCounts,
    barangayData,
    heatmapData,
    highValueCounts,
    commodityCategories,
}: DashboardProps) {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [distributionType, setDistributionType] = useState<
        "allocations" | "commodities" | "farmers" | "highValue"
    >("allocations");
    const [subtype, setSubtype] = useState<string>("");

    const transformedData = commodityCategories.map((category) => ({
        ...category,
        commodities: Object.entries(category.commodities).map(
            ([name, count]) => ({
                name,
                count: typeof count === "number" ? count : 0,
            })
        ),
    }));

    const pieData = [
        { name: "Registered", value: registeredFarmers },
        { name: "Unregistered", value: unregisteredFarmers },
    ];

    const [geoData, setGeoData] = useState<any>(null);
    const [distributionData, setDistributionData] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const geoResponse = await axios.get("/Digos_City.geojson");
                setGeoData(geoResponse.data);

                const distributionResponse = await axios.get("/dashboard");
                setDistributionData(distributionResponse.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    const [selectedYear, setSelectedYear] = useState<number>(
        new Date().getFullYear()
    );
    const [dashboardData, setDashboardData] = useState<DashboardProps | null>(
        null
    );

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`/dashboard`, {
                    params: { year: selectedYear },
                });
                setDashboardData(response.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, [selectedYear]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl block text-gray-800 leading-tight">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="flex mb-5 gap-4">
                <Dropdown>
                    <Dropdown.Trigger>
                        <button className="rounded-[12px] border border-slate-200 p-2 flex">
                            Year <ChevronDown size={15} className="mt-1 ml-3" />
                        </button>
                    </Dropdown.Trigger>
                    <Dropdown.Content align="left">
                        <Dropdown.Link href="/link1">2024</Dropdown.Link>
                        <Dropdown.Link href="/link2">2023</Dropdown.Link>
                        <Dropdown.Link href="/link3">2022</Dropdown.Link>
                        <Dropdown.Link href="/link2">2021</Dropdown.Link>
                        <Dropdown.Link href="/link3">2020</Dropdown.Link>
                        <Dropdown.Link href="/link3">2019</Dropdown.Link>
                    </Dropdown.Content>
                </Dropdown>
            </div>

            <div className="grid grid-flow-row grid-rows-1 gap-3 ">
                <div className="grid grid-flow-col grid-cols-5 gap-2">
                    {Object.entries(commodityCounts).map(
                        ([categoryName, commodities]) => {
                            if (Array.isArray(commodities)) {
                                return (
                                    <Card
                                        key={categoryName}
                                        title={categoryName}
                                    >
                                        {commodities.map(
                                            (
                                                commodity: {
                                                    name: string;
                                                    count: number;
                                                },
                                                index: number
                                            ) => (
                                                <p key={index}>
                                                    {commodity.name} -{" "}
                                                    {commodity.count}
                                                </p>
                                            )
                                        )}
                                    </Card>
                                );
                            } else {
                                return (
                                    <div key={categoryName}>
                                        No commodities available
                                    </div>
                                );
                            }
                        }
                    )}

                    <div>
                        <Card title="Farmers">
                            <h1 className="font-semibold text-2xl">
                                {totalFarmers}
                            </h1>
                            <span></span>
                        </Card>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="grid grid-row-2">
                        <div>
                            <Card title="Distribution of Commodities">
                                <div>
                                    {geoData && (
                                        <Heatmap
                                            distributionData={heatmapData}
                                            geoData={geoData}
                                        />
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>

                <Card title="Barangay Data Distribution">
                    <>
                        <select
                            onChange={(e) =>
                                setDistributionType(
                                    e.target.value as
                                        | "allocations"
                                        | "commodities"
                                        | "farmers"
                                        | "highValue"
                                )
                            }
                        >
                            <option value="allocations">Allocations</option>
                            <option value="commodities">Commodities</option>
                            <option value="farmers">Farmers</option>
                            <option value="highValue">High Value Crops</option>
                        </select>

                        <GroupedBarChart
                            data={heatmapData}
                            distributionType={distributionType}
                        />
                    </>
                </Card>

                {/* <BoxPlot
                    heatmapData={heatmapData}
                    selectedBarangay={selectedBarangay}
                /> */}
            </div>
        </AuthenticatedLayout>
    );
}
