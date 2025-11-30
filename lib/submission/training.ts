import{supabaseBrowser} from "@/lib/supabase/supabase-browser"
import {getCurrentUser} from "@/lib/auth/auth-service"
const supabase = supabaseBrowser();

export interface ModuleInput {
  name: string;
  category: string;
  subCategory?: string | null;
  distance?: number | null;
  durationMinutes?: number | null;
  durationSeconds?: number | null;
  weight?: number | null;
  description?: string | null;
}



export async function addNewModule(data:ModuleInput) {
    const supabase = supabaseBrowser();
    const { user } = await getCurrentUser();

    console.log('🔵 add module was called:', {
    name: data.name,
  category: data.category,
  sub_category: data.subCategory,
  distance: data.distance,
  durationMinutes:data.durationMinutes,
  durationSeconds:data.durationSeconds,
  weight:data.weight,
  description:data.description

  });

  try{
  const payload = {
  id: crypto.randomUUID(), // required since id has no default
  owner: user?.id,
  name: data.name.trim(),
  category: data.category,
  subCategory: data.subCategory,
  distance: data.distance ?? null,
  durationMinutes: data.durationMinutes ?? null,
  durationSeconds: data.durationSeconds ?? null,
  weight: data.weight ?? null,
  description: data.description?.trim() ?? null,
};


    const { data: insertedModule, error } = await supabase
      .from("module")
      .insert([payload])
      .select()
      .single();

      if(error){
              console.error("❌ addNewModule error:", error);
      return {
        success: false,
        message: error.message,
        error,
      };

      }

    console.log("✅ Module created successfully:", insertedModule);
    return {
      success: true,
      data: insertedModule,
      message: "Module created successfully",
    };

  }catch(err){
        console.error("❌ Unexpected error in addNewModule:", err);
    return {
      success: false,
      message: "Unexpected error",
      error: err,
    };
  }

}