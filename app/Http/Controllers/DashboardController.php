<?php

namespace App\Http\Controllers;

use App\Models\Allocation;
use App\Models\AllocationType;
use App\Models\Barangay;
use App\Models\Commodity;
use App\Models\CommodityCategory;
use App\Models\Farmer;
use App\Models\Farm;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $barangays = Barangay::all();
        $allocations = Allocation::all();
        $allocationTypes = AllocationType::all();
        $commodityCategories = CommodityCategory::with('commodities')->get();
        $registeredFarmers = Farmer::where('status', 'registered')->count();
        $unregisteredFarmers = Farmer::where('status', 'unregistered')->count();
        $totalFarmers = Farmer::count();
        
        $heatmapData = [];
        $commodityCounts = [];

        foreach ($barangays as $barangay) {
            $barangayFarms = Farm::with('farmer')->where('brgy_id', $barangay->id)->get();
            $registeredFarmersInBarangay = $barangayFarms->filter(fn($farm) => $farm->farmer->status === 'registered')->count();
            $unregisteredFarmersInBarangay = $barangayFarms->filter(fn($farm) => $farm->farmer->status === 'unregistered')->count();
            
            // Initialize barangay data in heatmap
            $heatmapData[$barangay->name] = [
                'allocations' => [],
                'commodities' => [],
                'farmers' => [
                    'Registered' => $registeredFarmersInBarangay,
                    'Unregistered' => $unregisteredFarmersInBarangay,
                ],
                'highValue' => [],
            ];

            // Count allocations per allocation type
            foreach ($allocationTypes as $type) {
                $count = $allocations->where('allocation_type_id', $type->id)->where('brgy_id', $barangay->id)->count();
                $heatmapData[$barangay->name]['allocations'][$type->name] = $count;
            }

            // Count commodities per category in the barangay
            foreach ($commodityCategories as $category) {
                // Initialize category in commodityCounts if not already
                if (!isset($commodityCounts[$category->name])) {
                    $commodityCounts[$category->name] = [];
                }

                $categoryCommodities = [];
                foreach ($category->commodities as $commodity) {
                    // Count the number of farms in the barangay that grow this specific commodity
                    $count = $barangayFarms->filter(function ($farm) use ($commodity) {
                        return $farm->commodity_id === $commodity->id;
                    })->count();

                    // Add commodity with count to the categoryCommodities array
                    $categoryCommodities[] = [
                        'name' => $commodity->name,
                        'count' => $count,
                    ];

                    // Store commodity counts in heatmap data
                    $heatmapData[$barangay->name]['commodities'][$category->name] = $categoryCommodities;

                    // Add count to the commodityCounts array
                    $commodityCounts[$category->name] = $categoryCommodities;
                }
            }
        }

        return Inertia::render('Super Admin/Dashboard', [
            'totalAllocations' => $allocations->count(),
            'commodityCategories' => $commodityCategories,
            'allocationTypes' => $allocationTypes,
            'registeredFarmers' => $registeredFarmers,
            'unregisteredFarmers' => $unregisteredFarmers,
            'totalFarmers' => $totalFarmers,
            'heatmapData' => $heatmapData,
            'commodityCounts' => $commodityCounts,
        ]);
    }
}