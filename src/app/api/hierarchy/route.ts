import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSuccessResponse, createErrorResponse } from '@/lib/server/response';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const hierarchy = db.hierarchy.get();
    return createSuccessResponse(
      {
        hierarchy,
        provinces: hierarchy.map((p) => p.name),
        totalProvinces: hierarchy.length,
      },
      'Ecclesiastical hierarchy retrieved successfully.',
      200
    );
  } catch (error: any) {
    return createErrorResponse(
      error.message || 'Failed to fetch hierarchy.',
      [error.message || 'Database error'],
      500
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, hierarchy, province, provinceId, district, districtId, branch, branchId, houseOfPrayer, performedBy } = body;

    const currentHierarchy = db.hierarchy.get();

    if (action === 'save_all' && Array.isArray(hierarchy)) {
      const saved = db.hierarchy.saveAll(hierarchy, performedBy || 'Admin Directorate');
      return createSuccessResponse({ hierarchy: saved }, 'Ecclesiastical hierarchy saved successfully.', 200);
    }

    if (action === 'add_province' && province) {
      const newProv = {
        id: province.id || `prov_${Date.now()}`,
        name: province.name,
        shortCode: province.shortCode || province.name.substring(0, 3).toUpperCase(),
        districts: province.districts || [],
      };
      const updated = db.hierarchy.addProvince(newProv, performedBy || 'Admin Directorate');
      return createSuccessResponse({ hierarchy: updated, province: newProv }, 'Province added successfully.', 201);
    }

    if (action === 'update_province' && provinceId && province) {
      const updated = db.hierarchy.updateProvince(provinceId, province, performedBy || 'Admin Directorate');
      return createSuccessResponse({ hierarchy: updated }, 'Province updated successfully.', 200);
    }

    if (action === 'delete_province' && provinceId) {
      const updated = db.hierarchy.deleteProvince(provinceId, performedBy || 'Admin Directorate');
      return createSuccessResponse({ hierarchy: updated }, 'Province deleted successfully.', 200);
    }

    // District actions
    if (action === 'add_district' && provinceId && district) {
      const provIndex = currentHierarchy.findIndex((p) => p.id === provinceId || p.name === provinceId);
      if (provIndex === -1) return createErrorResponse('Province not found', ['Invalid province ID'], 404);

      const newDist = {
        id: district.id || `dist_${Date.now()}`,
        name: district.name,
        branches: district.branches || [],
      };
      currentHierarchy[provIndex].districts.push(newDist);
      const saved = db.hierarchy.saveAll(currentHierarchy, performedBy || 'Admin Directorate');
      return createSuccessResponse({ hierarchy: saved, district: newDist }, 'District added successfully.', 201);
    }

    if (action === 'delete_district' && provinceId && districtId) {
      const provIndex = currentHierarchy.findIndex((p) => p.id === provinceId || p.name === provinceId);
      if (provIndex === -1) return createErrorResponse('Province not found', ['Invalid province ID'], 404);

      currentHierarchy[provIndex].districts = currentHierarchy[provIndex].districts.filter(
        (d) => d.id !== districtId && d.name !== districtId
      );
      const saved = db.hierarchy.saveAll(currentHierarchy, performedBy || 'Admin Directorate');
      return createSuccessResponse({ hierarchy: saved }, 'District deleted successfully.', 200);
    }

    // Branch actions
    if (action === 'add_branch' && provinceId && districtId && branch) {
      const provIndex = currentHierarchy.findIndex((p) => p.id === provinceId || p.name === provinceId);
      if (provIndex === -1) return createErrorResponse('Province not found', ['Invalid province ID'], 404);

      const distIndex = currentHierarchy[provIndex].districts.findIndex((d) => d.id === districtId || d.name === districtId);
      if (distIndex === -1) return createErrorResponse('District not found', ['Invalid district ID'], 404);

      const newBranch = {
        id: branch.id || `br_${Date.now()}`,
        name: branch.name,
        housesOfPrayer: branch.housesOfPrayer || ['Main House of Prayer'],
      };
      currentHierarchy[provIndex].districts[distIndex].branches.push(newBranch);
      const saved = db.hierarchy.saveAll(currentHierarchy, performedBy || 'Admin Directorate');
      return createSuccessResponse({ hierarchy: saved, branch: newBranch }, 'Parish Branch added successfully.', 201);
    }

    if (action === 'delete_branch' && provinceId && districtId && branchId) {
      const provIndex = currentHierarchy.findIndex((p) => p.id === provinceId || p.name === provinceId);
      if (provIndex === -1) return createErrorResponse('Province not found', ['Invalid province ID'], 404);

      const distIndex = currentHierarchy[provIndex].districts.findIndex((d) => d.id === districtId || d.name === districtId);
      if (distIndex === -1) return createErrorResponse('District not found', ['Invalid district ID'], 404);

      currentHierarchy[provIndex].districts[distIndex].branches = currentHierarchy[provIndex].districts[distIndex].branches.filter(
        (b) => b.id !== branchId && b.name !== branchId
      );
      const saved = db.hierarchy.saveAll(currentHierarchy, performedBy || 'Admin Directorate');
      return createSuccessResponse({ hierarchy: saved }, 'Parish Branch deleted successfully.', 200);
    }

    // House of Prayer actions
    if (action === 'add_house_of_prayer' && provinceId && districtId && branchId && houseOfPrayer) {
      const provIndex = currentHierarchy.findIndex((p) => p.id === provinceId || p.name === provinceId);
      if (provIndex === -1) return createErrorResponse('Province not found', ['Invalid province ID'], 404);

      const distIndex = currentHierarchy[provIndex].districts.findIndex((d) => d.id === districtId || d.name === districtId);
      if (distIndex === -1) return createErrorResponse('District not found', ['Invalid district ID'], 404);

      const brIndex = currentHierarchy[provIndex].districts[distIndex].branches.findIndex((b) => b.id === branchId || b.name === branchId);
      if (brIndex === -1) return createErrorResponse('Branch not found', ['Invalid branch ID'], 404);

      if (!currentHierarchy[provIndex].districts[distIndex].branches[brIndex].housesOfPrayer) {
        currentHierarchy[provIndex].districts[distIndex].branches[brIndex].housesOfPrayer = [];
      }
      currentHierarchy[provIndex].districts[distIndex].branches[brIndex].housesOfPrayer.push(houseOfPrayer);
      const saved = db.hierarchy.saveAll(currentHierarchy, performedBy || 'Admin Directorate');
      return createSuccessResponse({ hierarchy: saved }, 'House of Prayer added successfully.', 201);
    }

    return createErrorResponse('Invalid action specified', ['Unknown action'], 400);
  } catch (error: any) {
    return createErrorResponse(
      error.message || 'Failed to process hierarchy update.',
      [error.message || 'Server error'],
      500
    );
  }
}

